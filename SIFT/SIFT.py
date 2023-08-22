import cv2 
import numpy as np
for i in range(2,10):
    print(i)

    image1 = cv2.imread("(1).jpg")
    image2 = cv2.imread("("+str(i)+").jpg")
    height,weight= image1.shape[:2]
    sift = cv2.SIFT_create(nfeatures=500,  sigma=1.8 )
    keypoints1, descriptors1 = sift.detectAndCompute(image1, None)
    keypoints2, descriptors2 = sift.detectAndCompute(image2, None)
    bf = cv2.BFMatcher( cv2.NORM_L2)
    matches = bf.knnMatch(descriptors1, descriptors2, k=2 )
    good = []
    for m,n in matches:
        if m.distance < 0.75*n.distance:
            good.append(m)
    src_pts  = np.float32([keypoints2[m.trainIdx].pt for m in good])
    dst_pts  = np.float32([keypoints1[m.queryIdx].pt for m in good])
    try:
        h, _ = cv2.findHomography(src_pts, dst_pts,   cv2.RANSAC,5.0)#
        sift_after = cv2.warpPerspective( image2,  h, (image1.shape[1], image1.shape[0]))
    except:
        sift_after=np.zeros((height,weight,3), np.uint8)
    cv2.imwrite('sift_('+str(i)+').jpg', sift_after)