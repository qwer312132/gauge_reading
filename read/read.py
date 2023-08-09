import cv2
import numpy as np
import itertools

max_points2 = None
min_points2 = None

# def godistance(matrix):
#     ones_positions = [(i, j) for i, row in enumerate(matrix) for j, value in enumerate(row) if value == 1]
#     max_points2 = ones_positions[0]
#     min_points2 = ones_positions[0]
    
#     for i in range(4):
        
    
def distance(point1, point2):
    return ((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)**0.5

def find_max_distance(matrix):
    ones_positions = [(i, j) for i, row in enumerate(matrix) for j, value in enumerate(row) if value == 1]
    max_distance = 0
    max_points = None

    for pair in itertools.combinations(ones_positions, 2):
        dist = distance(pair[0], pair[1])
        if dist > max_distance:
            max_distance = dist
            max_points = pair

    return max_points, max_distance


# 读取PNG图像
mask_path = 'test_masks.png'
mask = cv2.imread(mask_path,cv2.IMREAD_GRAYSCALE)  # 保持原始通道数，不进行颜色转换

image_path = 'test.jpg'
image = cv2.imread(image_path)  # 保持原始通道数，不进行颜色转换

# 缩小图像到307x480像素
desired_width = 408
desired_height = 307

mask = cv2.resize(mask, (desired_width, desired_height))
image = cv2.resize(image, (desired_width, desired_height))

# 将mask中小于255的像素值设为0，大于等于255的像素值设为1
mask = np.where(mask < 255, 0, 1)
        
# print(mask.unique())
unique_values = np.unique(mask)
print("Unique values in the mask:", unique_values)

max_points, max_distance = find_max_distance(mask)
print("Max Distance:", max_distance)
print("Points:", max_points)


# 在图像上标记max_points
if max_points:
    for point in max_points:
        cv2.circle(image, (point[1], point[0]), 5, (0, 0, 255), -1)  # 在图像上绘制红色圆点

cv2.imshow('Image', image)

cv2.waitKey(0)
cv2.destroyAllWindows()

