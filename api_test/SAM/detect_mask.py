# import numpy as np
# import matplotlib.pyplot as plt
# from segment_anything import sam_model_registry, SamPredictor
# from .show import show_mask, show_points, show_box, show_mask_on_image
# from .calculate import KnowledgeDistillation

# def getmasks_bypoint(image, x, y):
#     sam_checkpoint = "SAM/sam_vit_h_4b8939.pth"
#     model_type = "vit_h"
#     device = "cuda"

#     sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
#     sam.to(device=device)

#     predictor = SamPredictor(sam)

#     input_point = np.array([[x, y]])
#     input_label = np.array([1])
#     predictor.set_image(image)

#     masks, scores, logits = predictor.predict(
#         point_coords=input_point,
#         point_labels=input_label,
#         box=None,
#         multimask_output=True,
#     )
#     markedImage = []
#     for i, (mask, score) in enumerate(zip(masks, scores)):
#         masked_image = show_mask_on_image(image, mask)
#         # plt.figure(figsize=(10, 10))
#         # plt.imshow(masked_image)
#         # plt.show()
#         # masks[i] =  masked_image
#         markedImage.append(masked_image)
#     return masks, markedImage

# def getmasks_bypoint_float(image, x, y, choose_index):
#     sam_checkpoint = "SAM/sam_vit_h_4b8939.pth"
#     model_type = "vit_h"
#     device = "cuda"

#     sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
#     sam.to(device=device)

#     predictor = SamPredictor(sam)

#     input_point = np.array([[x, y]])
#     input_label = np.array([1])
#     predictor.set_image(image)

#     masks, scores, logits = predictor.predict(
#         point_coords=input_point,
#         point_labels=input_label,
#         box=None,
#         multimask_output=True,
#         return_logits=True,
#     )
#     return KnowledgeDistillation(masks[choose_index])

# def getmasks_bybox(image, x0, y0, x1, y1):
#     sam_checkpoint = "SAM/sam_vit_h_4b8939.pth"
#     model_type = "vit_h"
#     device = "cuda"

#     sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
#     sam.to(device=device)

#     predictor = SamPredictor(sam)

#     input_box = np.array([x0, y0, x1, y1])

#     predictor.set_image(image)

#     masks, scores, logits = predictor.predict(
#         point_coords=None,
#         point_labels=None,
#         box=input_box[None, :],
#         multimask_output=True,
#     )
#     markedImage = []
#     for i, (mask, score) in enumerate(zip(masks, scores)):
#         masked_image = show_mask_on_image(image, mask)
#         # plt.figure(figsize=(10, 10))
#         # plt.imshow(masked_image)
#         # plt.show()
#         markedImage.append(masked_image)
#     return masks, markedImage

# def getmasks_bybox_float(image, x0, y0, x1, y1, choose_index):
#     sam_checkpoint = "SAM/sam_vit_h_4b8939.pth"
#     model_type = "vit_h"
#     device = "cuda"

#     sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
#     sam.to(device=device)

#     predictor = SamPredictor(sam)

#     input_box = np.array([x0, y0, x1, y1])
#     predictor.set_image(image)

#     masks, scores, logits = predictor.predict(
#         point_coords=None,
#         point_labels=None,
#         box=input_box[None, :],
#         multimask_output=True,
#         return_logits=True,
#     )
#     return KnowledgeDistillation(masks[choose_index])
