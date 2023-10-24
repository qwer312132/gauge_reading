from detect_mask import getmasks_bypoint
import cv2
import numpy as np
image = cv2.imread("test.jpg")
mask = getmasks_bypoint(image, 500, 1000)
# mask = np.where(mask,255,0).astype(np.uint8)
# cv2.namedWindow("image",cv2.WINDOW_NORMAL)
# cv2.resizeWindow("image", 600,600)
# cv2.imshow("image",mask[0])
# cv2.waitKey(0)
# cv2.resizeWindow("image", 600,600)
# cv2.imshow("image",mask[1])
# cv2.waitKey(0)
# cv2.resizeWindow("image", 600,600)
# cv2.imshow("image",mask[2])
# cv2.waitKey(0)
# cv2.destroyAllWindows()
# print(type(mask))