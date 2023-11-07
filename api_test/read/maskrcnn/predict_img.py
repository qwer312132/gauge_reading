# this line use predict the one of image and show the result

import numpy as np
import cv2
import torch
import os
import glob
from read.maskrcnn.show_example import showbbox
import torch
from read.maskrcnn.train import get_model_instance_segmentation, get_transform
import read.maskrcnn.transforms as T
import torchvision


device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
path = "./PennFudanPed/needletest"


def eval_show(img):
    # img = cv2.resize(img,(len(img[0])//4,len(img)//4))
    transform1 = T.Compose([
        T.ToTensor(),  # range [0, 255] -> [0.0,1.0]
    ]
    )
    num_class = 3
    import time
    start = time.time()
    model = get_model_instance_segmentation(num_class)
    model.load_state_dict(torch.load("test.pth"),False)
    model.eval()
    device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
    end = time.time()
    print("get model")
    print(end-start)

    model.to(device)
    xx, _ = transform1(img, 0)
    start = time.time()
    xx,center_point = showbbox(model, xx)
    end = time.time()
    print("showbbox")
    print(end-start)
    return xx,center_point


if __name__ == '__main__':

    pa = glob.glob(f"{path}/*.jpg")
    
    for img_name in pa:
        color_image = cv2.imread(img_name)
        # color_image = cv2.resize(color_image,(400,400))
        import time
        start = time.time()
        image = eval_show(color_image)
        end = time.time()
        print(end-start)
    #     cv2.namedWindow('RealSense', cv2.WINDOW_NORMAL)
    #     cv2.imshow('RealSense', image)
    #     key = cv2.waitKey(0) & 0xFF
    #     if key == ord('q'):
    #         break
    # cv2.destroyAllWindows()


