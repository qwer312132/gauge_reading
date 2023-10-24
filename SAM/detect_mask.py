import numpy as np
import matplotlib.pyplot as plt
from segment_anything import sam_model_registry, SamPredictor
from show import show_mask, show_points, show_box

def getmasks_bypoint(image, x, y):
    sam_checkpoint = "sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    device = "cuda"

    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device=device)

    predictor = SamPredictor(sam)

    input_point = np.array([[x, y]])
    input_label = np.array([1])
    # plt.figure(figsize=(10,10))
    # plt.imshow(image)
    # show_box(input_box, plt.gca())
    # show_points(input_point, input_label, plt.gca())
    # plt.axis('on')
    # plt.show()
    predictor.set_image(image)

    masks, scores, logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        box=None,
        multimask_output=True,
    )
    # for i, (mask, score) in enumerate(zip(masks, scores)):
    #     plt.figure(figsize=(10,10))
    #     plt.imshow(image)
    #     show_mask(mask, plt.gca())
    #     # show_points(input_point, input_label, plt.gca())
    #     plt.title(f"Mask {i+1}, Score: {score:.3f}", fontsize=18)
    #     plt.axis('off')
    #     plt.show()
    return masks

def getmasks_bybox(image, x0, y0, x1, y1):
    sam_checkpoint = "sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    device = "cuda"

    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device=device)

    predictor = SamPredictor(sam)

    input_box = np.array([x0, y0, x1, y1])
    input_label = np.array([1])
    # plt.figure(figsize=(10,10))
    # plt.imshow(image)
    # show_box(input_box, plt.gca())
    # show_points(input_point, input_label, plt.gca())
    # plt.axis('on')
    # plt.show()
    predictor.set_image(image)

    masks, scores, logits = predictor.predict(
        point_coords=None,
        point_labels=None,
        box=input_box[None, :],
        multimask_output=True,
    )
    # for i, (mask, score) in enumerate(zip(masks, scores)):
    #     plt.figure(figsize=(10,10))
    #     plt.imshow(image)
    #     show_mask(mask, plt.gca())
    #     # show_points(input_point, input_label, plt.gca())
    #     plt.title(f"Mask {i+1}, Score: {score:.3f}", fontsize=18)
    #     plt.axis('off')
    #     plt.show()
    return masks
