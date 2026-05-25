from rest_framework import serializers
from .models import Memory, MemoryPhoto


class MemoryPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemoryPhoto
        fields = ['id', 'image_url', 'order', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class MemoryListSerializer(serializers.ModelSerializer):
    photo_count = serializers.IntegerField(source='photos.count', read_only=True)

    class Meta:
        model = Memory
        fields = ['id', 'title', 'description', 'youtube_url', 'thumbnail', 'memory_date', 'created_at', 'photo_count']
        read_only_fields = ['id', 'thumbnail', 'created_at']


class MemoryDetailSerializer(serializers.ModelSerializer):
    photos = MemoryPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Memory
        fields = ['id', 'title', 'description', 'youtube_url', 'thumbnail', 'memory_date', 'created_at', 'photos']
        read_only_fields = ['id', 'thumbnail', 'created_at']
