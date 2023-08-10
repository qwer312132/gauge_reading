import cv2
import numpy as np
import itertools


def version2_distance(matrix):
    ones_positions = [(i, j) for i, row in enumerate(matrix) for j, value in enumerate(row) if value == 1]
    max_points2 = ones_positions[0]
    min_points2 = ones_positions[0]
    
    for i in range(len(ones_positions)):
        if ones_positions[i][0] > max_points2[0] or (ones_positions[i][0] == max_points2[0] and ones_positions[i][1] > max_points2[1]):
            max_points2 = ones_positions[i]
            
        if ones_positions[i][0] < min_points2[0] or (ones_positions[i][0] == min_points2[0] and ones_positions[i][1] < min_points2[1]):
            min_points2 = ones_positions[i]
            
    return max_points2,min_points2
        
    
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

    return max_points


def angle_between_xy_vectors(vector1, vector2):
    
    # Swap X and Y components
    vector1 = np.array([vector1[1], vector1[0]])
    vector2 = np.array([vector2[1], vector2[0]])
    
    angle_radians = np.arctan2(vector2[1], vector2[0]) - np.arctan2(vector1[1], vector1[0])
    
    # Ensure the angle is between 0 and 360 degrees
    angle_degrees = np.degrees(angle_radians) % 360
    
    return angle_degrees


def calculate_water_meter_reading(center, start_mark, end_mark, pointer_head, start, end):
    # 计算指针指向的角度
    pointer_angle = angle_between_xy_vectors(start-center, pointer_head-center)
    
    print(pointer_angle)
    # 计算开始位置到结束位置的角度
    start_to_end_angle = angle_between_xy_vectors(start-center, end-center)
    print(start_to_end_angle)
    # 计算水表读数
    water_meter_reading = (pointer_angle / start_to_end_angle) * (end_mark - start_mark) + start_mark

    return water_meter_reading


# 定义鼠标点击事件的回调函数
def mouse_callback(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        print("Clicked coordinates: ({}, {})".format(x, y))


# 读取PNG图像
mask_path = 'test_masks.png'
mask = cv2.imread(mask_path,cv2.IMREAD_GRAYSCALE)  # 保持原始通道数，不进行颜色转换

image_path = 'test.jpg'
image = cv2.imread(image_path)  # 保持原始通道数，不进行颜色转换


mask = cv2.resize(mask, (mask.shape[1]//4, mask.shape[0]//4))
image = cv2.resize(image, (image.shape[1]//4, image.shape[0]//4))

# 将mask中小于255的像素值设为0，大于等于255的像素值设为1
mask = np.where(mask < 255, 0, 1)

min_points2,max_points2 = version2_distance(mask)
print("Max Points:", max_points2)
print("Min Points:", min_points2)
        
# max_points = find_max_distance(mask)

# print("Points:", max_points)

start_ponit = np.array([586,377])
center_point = np.array([456,378])
end_point = np.array([457,511])


# 调用函数计算水表读数
reading = calculate_water_meter_reading(center_point, 0, 100, np.array([310,373]), start_ponit, end_point)

print("Water meter reading:", reading)



# 创建一个窗口并设置鼠标回调函数
cv2.namedWindow('Image')
cv2.setMouseCallback('Image', mouse_callback)

cv2.circle(image, (max_points2[1], max_points2[0]), 3, (0, 0, 255), -1)

# 在图像上绘制带箭头的线
cv2.arrowedLine(image, (center_point[1],center_point[0]), (max_points2[1], max_points2[0]), (0, 0, 255), 2)  # 用红色绘制带箭头的线


cv2.circle(image, (center_point[1],center_point[0]), 3, (0, 0, 0), -1)  # 黑色圆点   
 
cv2.circle(image, (start_ponit[1], start_ponit[0]), 3, (255, 0, 0), -1)  #  藍色圆点

cv2.circle(image, (end_point[1], end_point[0]), 3, (0, 255, 0), -1)  #  绿色圆点

cv2.imshow('Image', image)

cv2.waitKey(0)
cv2.destroyAllWindows()

