from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import MyDataSerializer
from .models import MyData
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
import cv2
import os
from read.read import read
from SAM.detect_mask import getmasks_bypoint
import numpy as np
# Create your views here.
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyData.objects.all()
    serializer_class = MyDataSerializer
    # def list(self, request):
    #     return Response({'test':'test'},status=status.HTTP_200_OK, content_type = 'application/json')
    def create(self, request, *args, **kwargs):
        # 获取POST请求的数据
        data = request.data.get('data')
        image = request.data.get('image')
        print(str(image))
        # 调用read函数并设置gauge_data字段的值
        image_data = image.read()
        image_array = np.frombuffer(image_data, np.uint8)
        imagenumpy = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        mask = getmasks_bypoint(image, 500, 1000)
        cv2.imshow("image",mask[0])
        cv2.waitKey(0)
        cv2.imshow("image",mask[1])
        cv2.waitKey(0)
        cv2.imshow("image",mask[2])
        cv2.destroyAllWindows()
        result = read(imagenumpy)

        # 创建MyData实例，并保存到数据库
        my_data = MyData(data=data, image=image, gauge_data=result)
        # my_data.save()

        return Response({'message': result}, status=status.HTTP_201_CREATED)
    def list(self, request):
        # Retrieve the newest object based on timestamp_field
        newest_object = MyData.objects.latest('id')
        # print(type(newest_object))
        imagedata = str(newest_object.gauge_data)
        # print(imagename)
        return Response({'data':imagedata},status=status.HTTP_200_OK, content_type = 'application/json')