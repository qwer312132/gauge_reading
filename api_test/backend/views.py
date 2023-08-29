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
# Create your views here.
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyData.objects.all()
    serializer_class = MyDataSerializer
    # def list(self, request):
    #     return Response({'test':'test'},status=status.HTTP_200_OK, content_type = 'application/json')
    def list(self, request):
        # Retrieve the newest object based on timestamp_field
        newest_object = MyData.objects.latest('id')
        print(type(newest_object))
        imagename = str(newest_object.image)
        print(imagename)
        return Response({'data':read(imagename)},status=status.HTTP_200_OK, content_type = 'application/json')