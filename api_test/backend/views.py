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
# from SAM.detect_mask import getmasks_bypoint, getmasks_bybox, getmasks_bypoint_float, getmasks_bybox_float
import numpy as np
import base64
from io import BytesIO
import json
from django.core.files.uploadedfile import InMemoryUploadedFile
import read.maskrcnn.train as train
# Create your views here.
def mark(request):
    imageLength = request.data.get('imageLength')
    returnimage = []
    # scaleStartCoordinate = json.loads(request.data.get('scaleStartCoordinate'))
    # scaleEndCoordinate = json.loads(request.data.get('scaleEndCoordinate'))
    # scaleStartValue = json.loads(request.data.get('scaleStartValue'))
    # scaleEndValue = json.loads(request.data.get('scaleEndValue'))
    pointerCoordinates = json.loads(request.data.get('pointerCoordinates'))
    # discFrameStartCoordinates = json.loads(request.data.get('discFrameStartCoordinates'))
    # discFrameEndCoordinates = json.loads(request.data.get('discFrameEndCoordinates'))
    for i in range(int(imageLength)):
        image = request.data.get('image'+str(i))
        # 调用read函数并设置gauge_data字段的值
        image_data = image.read()
        image_array = np.frombuffer(image_data, np.uint8)
        imagenumpy = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        height, width, channels = imagenumpy.shape
        new_width = 200
        new_height = int(height * new_width / width)
        imagenumpy = cv2.resize(imagenumpy, (new_width, new_height))
        imagebuffer = cv2.imencode('.jpg', imagenumpy)[1].tobytes()
        origin_image_bytesio = BytesIO(imagebuffer)
        needleX = pointerCoordinates[i][0]['x']
        needleY = pointerCoordinates[i][0]['y']
        # discFrameStartX = discFrameStartCoordinates[i][0]['x']
        # discFrameStartY = discFrameStartCoordinates[i][0]['y']
        # discFrameEndX = discFrameEndCoordinates[i][0]['x']
        # discFrameEndY = discFrameEndCoordinates[i][0]['y']
        needlemask,mixneedlemask = getmasks_bypoint(imagenumpy, needleX, needleY)
        # discmask,mixdiscmask = getmasks_bybox(imagenumpy, discFrameStartX, discFrameStartY, discFrameEndX, discFrameEndY)
        needlemaskKD = []
        for j in range(3):
            print(j)
            needlemaskKD.append(getmasks_bypoint_float(imagenumpy, needleX, needleY, j))
            # discmaskKD.append(getmasks_bybox_float(imagenumpy, discFrameStartX, discFrameStartY, discFrameEndX, discFrameEndY, j))
        needlemask = np.where(needlemask,255,0)
        discmask = np.where(discmask,255,0)
        for j in range(3):            
            maskrcnn = Maskrcnndata()
            # maskrcnn.startx = scaleStartCoordinate['x']
            # maskrcnn.starty = scaleStartCoordinate['y']
            # maskrcnn.startvalue = scaleStartValue
            # maskrcnn.endx = scaleEndCoordinate['x']
            # maskrcnn.endy = scaleEndCoordinate['y']
            # maskrcnn.endvalue = scaleEndValue
            # maskrcnn.image.save(f'image_{i}_{j}.jpg', image)
            maskrcnn.image.save(f'image_{i}_{j}.jpg', InMemoryUploadedFile(origin_image_bytesio, None, f'image_{i}_{j}.jpg', 'image/jpeg', len(imagebuffer), None))
            buffer = BytesIO()
            np.save(buffer, needlemaskKD[j])
            buffer.seek(0)
            maskrcnn.needleKD.save(f'needlemask_{i}_{j}.npy', InMemoryUploadedFile(buffer, None, f'needlemask_{i}_{j}.npy', 'application/octet-stream', buffer.tell(), None))
            temp = mixneedlemask[j].copy()
            encode_image = cv2.imencode('.jpg', temp)[1]
            returnimage.append(base64.b64encode(encode_image.tostring()).decode('utf-8'))
            temp = needlemask[j].copy()
            temp = np.reshape(temp,(temp.shape[0],temp.shape[1],1))
            print(temp.shape)
            buffer = cv2.imencode('.jpg', temp)[1].tobytes()

            image_bytesio = BytesIO(buffer)
            maskrcnn.needlemask.save(f'needlemask_{i}_{j}.jpg', InMemoryUploadedFile(image_bytesio, None, f'needlemask_{i}_{j}.jpg', 'image/jpeg', len(buffer), None))           
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

def modifyfilename():
    directory = "maskrcnnFile/trainMask/"
    for filename in os.listdir(directory):
        if "discmask" in filename and filename.endswith(".npy"):
            os.rename(directory+filename, directory+"image"+filename.split('_')[1]+"_3.npy")
        elif "needlemask" in filename and filename.endswith(".npy"):
            os.rename(directory+filename, directory+"image"+filename.split('_')[1]+"_1.npy")
        elif "discmask" in filename and filename.endswith(".jpg"):
            os.rename(directory+filename, directory+"image"+filename.split('_')[1]+"_2.jpg")
        elif "needlemask" in filename and filename.endswith(".jpg"):
            os.rename(directory+filename, directory+"image"+filename.split('_')[1]+'_0.jpg')
    directory = "maskrcnnFile/trainImage/"
    for filename in os.listdir(directory):
        os.rename(directory+filename, directory+"image"+filename.split('_')[1]+".jpg")

def dataAugmentationMask(directory):
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        if f.endswith(".npy"):
            array = np.load(f)
            for i in range(1,4):
                rotate_array = np.rot90(array, k=1)
                np.save(f.replace("_","-"+str(i)+"_"), rotate_array)
                array = rotate_image
        else:
            image = cv2.imread(f)
            for i in range(1,4):
                rotate_image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
                cv2.imwrite(f.replace("_","-"+str(i)+"_"), rotate_image)
                image = rotate_image

def dataAugmentationImage(directory):
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        print(f)
        image = cv2.imread(f)
        print(image.shape)
        for i in range(1,4):
            rotate_image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
            cv2.imwrite(f.replace(".jpg","-"+str(i)+".jpg"), rotate_image)
            image = rotate_image

class MyViewSet(viewsets.ModelViewSet):
    queryset = MyData.objects.all()
    serializer_class = MyDataSerializer
    def create(self, request, *args, **kwargs):
        # 获取POST请求的数据
        print(request.data)
        if(request.data.get('operation') == 'mark'):
            # return mark(request)
            return
        elif (request.data.get('operation') == 'choose_best'):
            ret = choose_best(request)
            modifyfilename()
            dataAugmentationMask("maskrcnnFile/trainMask/")
            dataAugmentationImage("maskrcnnFile/trainImage/")
            train.main()
            return ret
            # return Response({'message': 'success'}, status=status.HTTP_201_CREATED)
        elif(request.data.get('operation') == 'user_mark2'):
            scaleStartCoordinate = json.loads(request.data.get('scaleStartCoordinate'))
            scaleEndCoordinate = json.loads(request.data.get('scaleEndCoordinate'))
            scaleStartValue = json.loads(request.data.get('scaleStartValue'))
            scaleEndValue = json.loads(request.data.get('scaleEndValue'))
            discFrameCoordinates = json.loads(request.data.get('discFrameStartCoordinates'))
            with open('read/data.txt','w') as f:
                f.write(str(scaleStartCoordinate['x'])+'\n'+
                        str(scaleStartCoordinate['y'])+'\n'+
                        str(scaleStartValue)+'\n'+
                        str(scaleEndCoordinate['x'])+'\n'+
                        str(scaleEndCoordinate['y'])+'\n'+
                        str(scaleEndValue)+'\n'+
                        str(discFrameCoordinates['x'])+'\n'+
                        str(discFrameCoordinates['y']))
                
            image = request.data.get('image')
            image_data = image.read()
            image_array = np.frombuffer(image_data, np.uint8)
            imagenumpy = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            height, width, channels = imagenumpy.shape
            new_width = 400
            new_height = int(height * new_width / width)
            imagenumpy = cv2.resize(imagenumpy, (new_width, new_height))
            cv2.imwrite("read/SIFT/reference.jpg",imagenumpy)
        else:
            image = request.data.get('image')
            # 调用read函数并设置gauge_data字段的值
            image_data = image.read()
            image_array = np.frombuffer(image_data, np.uint8)
            imagenumpy = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            data = []
            with open('read/data.txt','r') as f:
                for line in f:
                    data.append(int(line))
            startx = data[0]
            starty = data[1]
            startvalue = data[2]
            endx = data[3]
            endy = data[4]
            endvalue = data[5]
            discx = data[6]
            discy = data[7]
            height, width, channels = imagenumpy.shape
            new_width = 400
            new_height = int(height * new_width / width)
            imagenumpy = cv2.resize(imagenumpy, (new_width, new_height))
            imagebuffer = cv2.imencode('.jpg', imagenumpy)[1].tobytes()
            image_bytesio = BytesIO(imagebuffer)
            mydata = MyData()
            result,return_image = read(imagenumpy,startx, starty, startvalue, endx, endy, endvalue, discx, discy)
            mydata.data = "test"
            mydata.gauge_data=result
            mydata.image.save('image.jpg', InMemoryUploadedFile(image_bytesio, None, 'image.jpg', 'image/jpeg', len(imagebuffer), None))
            encode_image = cv2.imencode('.jpg', return_image)[1]
            returnimage = base64.b64encode(encode_image.tostring()).decode('utf-8')
            return Response({'message':result,'image':returnimage},status=status.HTTP_200_OK, content_type = 'application/json')
        # else:
        #     return Response({'message': 'success'}, status=status.HTTP_201_CREATED)
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
    