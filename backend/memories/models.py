import uuid
from django.db import models
from django.utils import timezone


class Memory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    youtube_url = models.URLField(blank=True, default='')
    thumbnail = models.URLField(blank=True, default='')
    memory_date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-memory_date', '-created_at']

    def __str__(self):
        return self.title


class MemoryPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    memory = models.ForeignKey(Memory, on_delete=models.CASCADE, related_name='photos')
    image_url = models.URLField()
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f"{self.memory.title} - photo {self.order}"
