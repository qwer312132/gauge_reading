import os
import numpy as np
import torchvision
import torch
from PIL import Image
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.models.detection.mask_rcnn import MaskRCNNPredictor
import read.maskrcnn.utils as utils
import read.maskrcnn.transforms as T
from read.maskrcnn.engine import train_one_epoch, evaluate
import cv2


class PennFudanDataset(object):
    def __init__(self, root, transforms, classnum):
        self.root = root
        self.transforms = transforms
        # load all image files, sorting them to
        # ensure that they are aligned
        self.imgs = list(sorted(os.listdir(os.path.join(root, "needleimage"))))
        self.masks = list(sorted(os.listdir(os.path.join(root, "needlemask"))))
        self.classnum = classnum

    def __getitem__(self, idx):
        # load images and masks
        # print(idx)
        # print(len(self.imgs),len(self.masks))
        img_path = os.path.join(self.root, "needleimage", self.imgs[idx])
        img = Image.open(img_path).convert("RGB")
        boxes = []
        masks = []
        num_objs=0
        cls = self.classnum-1
        mask_path = img_path.replace("needleimage","needlemask")
        mask_path = mask_path.replace(".jpg","_2.png")
        for i in range(cls):
            # mask_path = os.path.join(self.root, "needlemask", self.masks[idx*cls+i])
            # print("mask path")
            # print(mask_path)
            # note that we haven't converted the mask to RGB,
            # because each color corresponds to a different instance
            # with 0 being background
            mask = Image.open(mask_path)
            # convert the PIL Image into a numpy array
            mask = np.array(mask)

            # instances are encoded as different colors
            obj_ids = np.unique(mask)
            # first id is the background, so remove it
            obj_ids = obj_ids[1:]
            # split the color-encoded mask into a set
            # of binary masks
            mask = mask == obj_ids[:, None, None]
            masks.append(mask[0])
            # get bounding box coordinates for each mask
            num_objs += len(obj_ids)
            # print(num_objs)
            for i in range(len(obj_ids)):
                pos = np.where(mask[i])
                xmin = np.min(pos[1])
                xmax = np.max(pos[1])
                ymin = np.min(pos[0])
                ymax = np.max(pos[0])
                boxes.append([xmin, ymin, xmax, ymax])
                # print(xmin,ymin,xmax,ymax)
            mask_path = mask_path.replace("_2.png",".png")
        # convert everything into a torch.Tensor
        boxes = torch.as_tensor(boxes, dtype=torch.float32)
        # there is only one class
        a = np.array([2,1])
        labels = torch.as_tensor(a, dtype=torch.int64)
        masks = torch.as_tensor(masks, dtype=torch.uint8)

        image_id = torch.tensor([idx])
        area = (boxes[:, 3] - boxes[:, 1]) * (boxes[:, 2] - boxes[:, 0])
        # suppose all instances are not crowd
        iscrowd = torch.ones((num_objs,), dtype=torch.int64)
        # print(masks.shape)
        target = {}
        target["boxes"] = boxes
        target["labels"] = labels
        target["masks"] = masks
        target["image_id"] = image_id
        target["area"] = area
        target["iscrowd"] = iscrowd

        if self.transforms is not None:
            img, target = self.transforms(img, target)

        return img, target

    def __len__(self):
        return len(self.imgs)

def get_model_instance_segmentation(num_classes):
    # load an instance segmentation model pre-trained pre-trained on COCO
    model = torchvision.models.detection.maskrcnn_resnet50_fpn(pretrained=True)

    # get number of input features for the classifier
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    # replace the pre-trained head with a new one
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    # now get the number of input features for the mask classifier
    in_features_mask = model.roi_heads.mask_predictor.conv5_mask.in_channels
    hidden_layer = 256
    # and replace the mask predictor with a new one
    model.roi_heads.mask_predictor = MaskRCNNPredictor(in_features_mask,
                                                       hidden_layer,
                                                       num_classes)

    return model

def get_transform(train):
    transforms = []
    # converts the image, a PIL image, into a PyTorch Tensor
    transforms.append(T.ToTensor())
    if train:
        # during training, randomly flip the training images
        # and ground-truth for data augmentation
        # 50%的概率水平翻轉
        transforms.append(T.RandomHorizontalFlip(0.5))

    return T.Compose(transforms)

def main():
    # train on the GPU or on the CPU, if a GPU is not available
    device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
    # device = torch.device('cpu')

    # our dataset has two classes only - background and person
    num_classes = 3
    # use our dataset and defined transformations
    dataset = PennFudanDataset('PennFudanPed', get_transform(train=True), num_classes)
    dataset_test = PennFudanDataset('PennFudanPed', get_transform(train=False), num_classes)
    
    # split the dataset in train and test set
    indices = torch.randperm(len(dataset)).tolist()

    dataset = torch.utils.data.Subset(dataset, indices[:-len(indices)//10])
    dataset_test = torch.utils.data.Subset(dataset_test, indices[-len(indices)//10:])

    # define training and validation data loaders
    data_loader = torch.utils.data.DataLoader(
        dataset, batch_size=1, shuffle=True, num_workers=1,
        collate_fn=utils.collate_fn)

    data_loader_test = torch.utils.data.DataLoader(
        dataset_test, batch_size=1, shuffle=False, num_workers=4,
        collate_fn=utils.collate_fn)

    # get the model using our helper function
    model = get_model_instance_segmentation(num_classes)

    # move model to the right device
    model.to(device)

    # construct an optimizer
    params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.SGD(params, lr=0.005,
                                momentum=0.85, weight_decay=0.0005)
    # and a learning rate scheduler
    lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer,
                                                   step_size=3,
                                                   gamma=0.1)

    # let's train it for 10 epochs
    num_epochs = 10

    for epoch in range(num_epochs):
        # train for one epoch, printing every 10 iterations
        if hasattr(torch.cuda, 'empty_cache'):
            torch.cuda.empty_cache()
        # with torch.no_grad():
        train_one_epoch(model, optimizer, data_loader, device, epoch, print_freq=10)
        # update the learning rate
        lr_scheduler.step()
        # evaluate on the test dataset
        evaluate(model, data_loader_test, device=device)

    torch.save(model.state_dict(), "test.pth")
    print("That's it!")


if __name__ == "__main__":

    main()


