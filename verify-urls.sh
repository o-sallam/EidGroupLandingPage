#!/bin/bash
# Check all current doc URLs

BASE="https://egroup.runasp.net/videosdocs"

echo "URL | Status | Content-Type | Accept-Ranges"
echo "--- | ------ | ------------ | -------------"

# Video 1: 5 images, 0 videos
for i in 1 2 3 4 5; do
  url="${BASE}/v1docs/images/${i}.webp"
  response=$(curl -sI "$url" 2>&1)
  status=$(echo "$response" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  content_type=$(echo "$response" | grep -i "^content-type:" | cut -d' ' -f2- | tr -d '\r')
  accept_ranges=$(echo "$response" | grep -i "^accept-ranges:" | cut -d' ' -f2- | tr -d '\r')
  echo "$url | ${status:-ERR} | ${content_type:--} | ${accept_ranges:--}"
done

# Video 2: 0 images, 3 videos
for i in 1 2 3; do
  url="${BASE}/v2docs/videos/${i}.mp4"
  response=$(curl -sI "$url" 2>&1)
  status=$(echo "$response" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  content_type=$(echo "$response" | grep -i "^content-type:" | cut -d' ' -f2- | tr -d '\r')
  accept_ranges=$(echo "$response" | grep -i "^accept-ranges:" | cut -d' ' -f2- | tr -d '\r')
  echo "$url | ${status:-ERR} | ${content_type:--} | ${accept_ranges:--}"
done

# Video 3: 0 images, 2 videos
for i in 1 2; do
  url="${BASE}/v3docs/videos/${i}.mp4"
  response=$(curl -sI "$url" 2>&1)
  status=$(echo "$response" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  content_type=$(echo "$response" | grep -i "^content-type:" | cut -d' ' -f2- | tr -d '\r')
  accept_ranges=$(echo "$response" | grep -i "^accept-ranges:" | cut -d' ' -f2- | tr -d '\r')
  echo "$url | ${status:-ERR} | ${content_type:--} | ${accept_ranges:--}"
done

# Video 4: 0 images, 4 videos
for i in 1 2 3 4; do
  url="${BASE}/v4docs/videos/${i}.mp4"
  response=$(curl -sI "$url" 2>&1)
  status=$(echo "$response" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  content_type=$(echo "$response" | grep -i "^content-type:" | cut -d' ' -f2- | tr -d '\r')
  accept_ranges=$(echo "$response" | grep -i "^accept-ranges:" | cut -d' ' -f2- | tr -d '\r')
  echo "$url | ${status:-ERR} | ${content_type:--} | ${accept_ranges:--}"
done

# Video 5: 0 images, 2 videos
for i in 1 2; do
  url="${BASE}/v5docs/videos/${i}.mp4"
  response=$(curl -sI "$url" 2>&1)
  status=$(echo "$response" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  content_type=$(echo "$response" | grep -i "^content-type:" | cut -d' ' -f2- | tr -d '\r')
  accept_ranges=$(echo "$response" | grep -i "^accept-ranges:" | cut -d' ' -f2- | tr -d '\r')
  echo "$url | ${status:-ERR} | ${content_type:--} | ${accept_ranges:--}"
done
