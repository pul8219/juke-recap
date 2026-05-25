import os
import uuid
import boto3
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Memory, MemoryPhoto
from .serializers import MemoryListSerializer, MemoryDetailSerializer, MemoryPhotoSerializer


def get_s3_client():
    kwargs = {
        'aws_access_key_id': settings.AWS_ACCESS_KEY_ID,
        'aws_secret_access_key': settings.AWS_SECRET_ACCESS_KEY,
        'region_name': settings.AWS_S3_REGION_NAME,
    }
    if settings.AWS_S3_ENDPOINT_URL:
        kwargs['endpoint_url'] = settings.AWS_S3_ENDPOINT_URL
    return boto3.client('s3', **kwargs)


def upload_file_to_s3(file_obj, filename):
    s3 = get_s3_client()
    key = f"photos/{filename}"
    s3.upload_fileobj(
        file_obj,
        settings.AWS_STORAGE_BUCKET_NAME,
        key,
        ExtraArgs={'ContentType': file_obj.content_type},
    )
    if settings.AWS_S3_CUSTOM_DOMAIN:
        return f"http://{settings.AWS_S3_CUSTOM_DOMAIN}/{key}"
    return f"{settings.AWS_S3_ENDPOINT_URL}/{settings.AWS_STORAGE_BUCKET_NAME}/{key}"


def delete_file_from_s3(image_url):
    s3 = get_s3_client()
    key = image_url.split(f"/{settings.AWS_STORAGE_BUCKET_NAME}/")[-1]
    s3.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key)


@api_view(['POST'])
def verify_pin(request):
    pin = request.data.get('pin', '')
    if pin == os.environ.get('APP_PASSCODE', ''):
        return Response({'ok': True})
    return Response({'ok': False}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'POST'])
def memory_list(request):
    if request.method == 'GET':
        memories = Memory.objects.all()
        serializer = MemoryListSerializer(memories, many=True)
        return Response(serializer.data)

    title = request.data.get('title', '')
    if not title:
        return Response({'error': 'title is required'}, status=status.HTTP_400_BAD_REQUEST)

    create_kwargs = {
        'title': title,
        'description': request.data.get('description', ''),
        'youtube_url': request.data.get('youtube_url', ''),
    }
    memory_date = request.data.get('memory_date')
    if memory_date:
        create_kwargs['memory_date'] = memory_date
    memory = Memory.objects.create(**create_kwargs)

    photos = request.FILES.getlist('photos')
    try:
        thumb_idx = int(request.data.get('thumbnail_index', 0))
    except (TypeError, ValueError):
        thumb_idx = 0

    uploaded_urls = []
    for i, photo in enumerate(photos):
        filename = f"{uuid.uuid4()}{_get_ext(photo.name)}"
        image_url = upload_file_to_s3(photo, filename)
        MemoryPhoto.objects.create(memory=memory, image_url=image_url, order=i)
        uploaded_urls.append(image_url)

    if uploaded_urls:
        safe_idx = min(thumb_idx, len(uploaded_urls) - 1)
        memory.thumbnail = uploaded_urls[safe_idx]
        memory.save(update_fields=['thumbnail'])

    serializer = MemoryDetailSerializer(memory)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
def memory_detail(request, pk):
    try:
        memory = Memory.objects.get(pk=pk)
    except Memory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MemoryDetailSerializer(memory)
        return Response(serializer.data)

    for photo in memory.photos.all():
        try:
            delete_file_from_s3(photo.image_url)
        except Exception:
            pass
    memory.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def memory_add_photos(request, pk):
    try:
        memory = Memory.objects.get(pk=pk)
    except Memory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    photos = request.FILES.getlist('photos')
    if not photos:
        return Response({'error': 'No photos provided'}, status=status.HTTP_400_BAD_REQUEST)

    max_order = memory.photos.count()
    created = []
    for i, photo in enumerate(photos):
        filename = f"{uuid.uuid4()}{_get_ext(photo.name)}"
        image_url = upload_file_to_s3(photo, filename)
        obj = MemoryPhoto.objects.create(memory=memory, image_url=image_url, order=max_order + i)
        created.append(obj)

    if not memory.thumbnail:
        memory.thumbnail = created[0].image_url
        memory.save(update_fields=['thumbnail'])

    serializer = MemoryPhotoSerializer(created, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def photo_delete(request, pk):
    try:
        photo = MemoryPhoto.objects.get(pk=pk)
    except MemoryPhoto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    memory = photo.memory
    try:
        delete_file_from_s3(photo.image_url)
    except Exception:
        pass
    photo.delete()

    if memory.thumbnail == photo.image_url:
        first = memory.photos.first()
        memory.thumbnail = first.image_url if first else ''
        memory.save(update_fields=['thumbnail'])

    return Response(status=status.HTTP_204_NO_CONTENT)


def _get_ext(filename):
    if '.' in filename:
        return '.' + filename.rsplit('.', 1)[1].lower()
    return ''
