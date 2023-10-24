import math
import numpy as np

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def find_T_for_sigmoid(value, target_sigmoid, lower_bound = 0.001, upper_bound = 1000):
    epsilon = 1e-5  # 定義一個很小的誤差範圍

    # 使用二分法逼近求解T
    while upper_bound - lower_bound > epsilon:
        mid = (lower_bound + upper_bound) / 2
        result = sigmoid(value / mid)
        if abs(result - target_sigmoid) < epsilon:
            return mid
        elif result < target_sigmoid:
            upper_bound = mid
        else:
            lower_bound = mid

    return (lower_bound + upper_bound) / 2


def sigmoid_with_temperature(logits, temperature):
    return 1 / (1 + np.exp(-logits / temperature))

def KnowledgeDistillation(choosed_mask):
    # 將masks陣列排序
    sorted_masks = np.sort(choosed_mask.flatten())

    # 找到大于0的索引
    positive_indices = np.where(sorted_masks > 0)[0]
    print(positive_indices)

    # 找到前90%位置的索引
    percentile_idx = int(len(positive_indices) * 0.9) - 1

    # 取前90%位置的數字
    value_90 = sorted_masks[positive_indices[percentile_idx]]
    print(value_90)

    print(choosed_mask)

    # 計算T值
    T = find_T_for_sigmoid(value_90, 0.9)

    # 計算T除完後的sigmoid值
    sigmoid_values = sigmoid_with_temperature(choosed_mask, T)

    print("計算得到的T值:", T)
    print("T除完後的sigmoid值:", sigmoid_values)
    print(sigmoid_with_temperature(choosed_mask[0][0],T))
    return sigmoid_values