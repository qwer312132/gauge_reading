import cv2
import numpy as np
import itertools
from read.maskrcnn.predict_img import eval_show
from read.SIFT.SIFT import SIFT
def version2_distance(matrix, center_point):
    ones_positions = [(i, j) for i, row in enumerate(matrix) for j, value in enumerate(row) if value == 1]
    print(matrix)
    max_points2 = ones_positions[0]
    min_points2 = ones_positions[0]
    
    for i in range(len(ones_positions)):
        if ones_positions[i][0] > max_points2[0] or (ones_positions[i][0] == max_points2[0] and ones_positions[i][1] > max_points2[1]):
            max_points2 = ones_positions[i]
            
        if ones_positions[i][0] < min_points2[0] or (ones_positions[i][0] == min_points2[0] and ones_positions[i][1] < min_points2[1]):
            min_points2 = ones_positions[i]
            
    if np.linalg.norm(max_points2 - center_point) > np.linalg.norm(min_points2 - center_point):
        return max_points2
    else:
        return min_points2
            
    
        
        
    
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
    print("vector")
    print(start-center,end-center)
    return water_meter_reading


# 定义鼠标点击事件的回调函数
def mouse_callback(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        print("Clicked coordinates: ({}, {})".format(x, y))

def read(image,startx, starty, startvalue, endx, endy, endvalue,discx,discy):
    
    image = SIFT(image)
    # image = cv2.resize(image,(image.shape[1]//4, image.shape[0]//4))
    needlemask, discmask = eval_show(image)
    needleContours, hierarchy = cv2.findContours(needlemask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    discContours, hierarchy = cv2.findContours(discmask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)


    center_point = np.array([discx,discy])
    # print(center_point)
    # center_point = np.array(center_point)
    # center_point[0],center_point[1]=center_point[1],center_point[0]
    needlemask = np.where(needlemask == 0, 0, 1)

    pointer_head = version2_distance(needlemask, center_point)
    pointer_head = np.array(pointer_head)
    pointer_head[0],pointer_head[1]=pointer_head[1],pointer_head[0]
    cv2.drawContours(image, needleContours, -1, (0, 255, 0), 5)
    cv2.circle(image, (startx,starty), 5, (0, 0, 255), -1)
    cv2.circle(image, (endx,endy), 5, (0, 0, 255), -1)
    cv2.arrowedLine(image, (center_point[0],center_point[1]), (pointer_head[0],pointer_head[1]), (0, 0, 255), 5)
    # cv2.drawContours(image, discContours, -1, (0, 0, 255), 5)
    # print("Pointer head:", pointer_head)
    # max_points = find_max_distance(mask)

    # print("Points:", max_points)

    start_ponit = np.array([starty,startx])
    end_point = np.array([endy,endx])


    # 调用函数计算水表读数
    reading = calculate_water_meter_reading(center_point, startvalue, endvalue, pointer_head, start_ponit, end_point)

    print("Water meter reading:", reading)

    
    return reading,image