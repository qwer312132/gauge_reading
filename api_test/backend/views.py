from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import MyDataSerializer
from .models import MyData

@api_view(['POST'])
def my_view(request):
    serializer = MyDataSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        data = validated_data['data']
        my_data = MyData(data=data)
        my_data.save()
        return Response({'message': 'POST request received and data saved'})
    else:
        return Response(serializer.errors, status=400)
