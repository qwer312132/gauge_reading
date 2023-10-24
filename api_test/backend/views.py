from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import MyDataSerializer
from .models import MyData
from .models import Maskrcnndata
from .serializers import MaskrcnndataSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
import cv2
import os
from read.read import read
from SAM.detect_mask import getmasks_bypoint
import numpy as np
import base64
from io import BytesIO
import json
from django.core.files.uploadedfile import InMemoryUploadedFile
# Create your views here.
def mark(request):
    imageLength = request.data.get('imageLength')
    returnimage = []
    scaleStartCoordinate = json.loads(request.data.get('scaleStartCoordinate'))
    scaleEndCoordinate = json.loads(request.data.get('scaleEndCoordinate'))
    scaleStartValue = json.loads(request.data.get('scaleStartValue'))
    scaleEndValue = json.loads(request.data.get('scaleEndValue'))
    for i in range(int(imageLength)):
        image = request.data.get('image'+str(i))
        # 调用read函数并设置gauge_data字段的值
        image_data = image.read()
        image_data2 = base64.b64encode(image_data).decode('utf-8')
        image_array = np.frombuffer(image_data, np.uint8)
        imagenumpy = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        for j in range(3):
            
            temp = imagenumpy.copy()
            cv2.putText(temp, str(j), (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 2)
            encode_image = cv2.imencode('.jpg', temp)[1]
            returnimage.append(base64.b64encode(encode_image.tostring()).decode('utf-8'))
            buffer = cv2.imencode('.jpg', temp)[1].tobytes()
            image_bytesio = BytesIO(buffer)
            maskrcnn = Maskrcnndata()
            maskrcnn.startx = scaleStartCoordinate['x']
            maskrcnn.starty = scaleStartCoordinate['y']
            maskrcnn.startvalue = scaleStartValue
            maskrcnn.endx = scaleEndCoordinate['x']
            maskrcnn.endy = scaleEndCoordinate['y']
            maskrcnn.endvalue = scaleEndValue
            maskrcnn.image.save(f'needleimage_{i}_{j}.jpg', InMemoryUploadedFile(image_bytesio, None, f'needleimage_{i}_{j}.jpg', 'image/jpeg', len(buffer), None))
    return Response({'message': 0,"image":returnimage}, status=status.HTTP_201_CREATED)
def choose_best(request):
    best = request.data.get('correctImageIndexs')
    print(best)
    best = best.split(',')
    best = list(map(int, best))
    maskrcnndata = Maskrcnndata.objects.all().order_by('id')
    for i in range(len(maskrcnndata)):
        if(i in best):
            continue
        else:
            if maskrcnndata[i].image:
                os.remove(maskrcnndata[i].image.path)
            if maskrcnndata[i].needlemask:
                os.remove(maskrcnndata[i].needlemask.path)
            if maskrcnndata[i].needleKD:
                os.remove(maskrcnndata[i].needleKD.path)
            if maskrcnndata[i].discmask:
                os.remove(maskrcnndata[i].discmask.path)
            if maskrcnndata[i].discKD:
                os.remove(maskrcnndata[i].discKD.path)
            maskrcnndata[i].delete()
    return Response({'message': 'success'}, status=status.HTTP_201_CREATED)
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyData.objects.all()
    serializer_class = MyDataSerializer
    # def list(self, request):
    #     return Response({'test':'test'},status=status.HTTP_200_OK, content_type = 'application/json')
    def create(self, request, *args, **kwargs):
        # 获取POST请求的数据
        print(request.data)
        if(request.data.get('operation') == 'user_mark2'):
            return mark(request)
        elif (request.data.get('operation') == 'choose_best'):
            return choose_best(request)
        
        #計算指針刻度
        # result = read(imagenumpy)

    def list(self, request):
        # Retrieve the newest object based on timestamp_field
        newest_object = MyData.objects.latest('id')
        # print(type(newest_object))
        imagedata = str(newest_object.gauge_data)
        # print(imagename)
        return Response({'data':imagedata},status=status.HTTP_200_OK, content_type = 'application/json')
class MaskrcnndataViewset(viewsets.ModelViewSet):
    queryset = Maskrcnndata.objects.all()
    serializer_class = MaskrcnndataSerializer
    