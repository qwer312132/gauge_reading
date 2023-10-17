from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import MyDataSerializer
from .models import MyData
from .models import Gaugedata
from .serializers import GaugedataSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
import cv2
import os
from read.read import read
import numpy as np
import base64
# Create your views here.
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyData.objects.all()
    serializer_class = MyDataSerializer
    # def list(self, request):
    #     return Response({'test':'test'},status=status.HTTP_200_OK, content_type = 'application/json')
    def create(self, request, *args, **kwargs):
        # 获取POST请求的数据
        data = request.data.get('data')
        image = request.data.get('image0')
        # 调用read函数并设置gauge_data字段的值
        image_data = image.read()
        image_data2 = base64.b64encode(image_data).decode('utf-8')
        image_array = np.frombuffer(image_data, np.uint8)
        imagenumpy = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        #計算指針刻度
        # result = read(imagenumpy)

        # 创建MyData实例，并保存到数据库
        # my_data = MyData(data=data, image=image, gauge_data=result)
        # my_data.save()

        return Response({'message': 0,"image":[image_data2,image_data2]}, status=status.HTTP_201_CREATED)
    def list(self, request):
        # Retrieve the newest object based on timestamp_field
        newest_object = MyData.objects.latest('id')
        # print(type(newest_object))
        imagedata = str(newest_object.gauge_data)
        # print(imagename)
        return Response({'data':imagedata},status=status.HTTP_200_OK, content_type = 'application/json')
class GaugedataViewset(viewsets.ModelViewSet):
    queryset = Gaugedata.objects.all()
    serializer_class = GaugedataSerializer
    def create(self, request, *args, **kwargs):
        # 获取POST请求的数据
        startx = request.data.get('startx')
        starty = request.data.get('starty')
        endx = request.data.get('endx')
        endy = request.data.get('endy')
        # 调用read函数并设置gauge_data字段的值
        # 创建MyData实例，并保存到数据库
        gauge_data = Gaugedata(startx=startx, starty=starty, endx=endx, endy=endy)
        gauge_data.save()

        return Response({'message': 'success'}, status=status.HTTP_201_CREATED)
    def list(self, request):
        # Retrieve the newest object based on timestamp_field
        newest_object = Gaugedata.objects.latest('id')
        # print(type(newest_object))
        startx = str(newest_object.startx)
        starty = str(newest_object.starty)
        endx = str(newest_object.endx)
        endy = str(newest_object.endy)
        # print(imagename)
        return Response({'startx':startx,'starty':starty,'endx':endx,'endy':endy},status=status.HTTP_200_OK, content_type = 'application/json')