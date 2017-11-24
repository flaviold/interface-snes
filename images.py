from os import listdir
from os.path import isfile, join
import json
import numpy as np
import cv2

from PIL import Image
from io import BytesIO
import base64

path = "/home/filipe/experimentos-snes/experiment-22-10-2017-9jdt3npxy1/"
name = "sample-"
frames = []
images = []

for f in listdir(path):
	if isfile(join(path, f)):
		data = json.load(open(join(path, f)))
		pair = (data["frame"], data["image"])
		frames.insert(0, pair)

frames.sort(key=lambda tup: tup[0])

fourcc = cv2.cv.CV_FOURCC(*'MJPG')
writer = cv2.VideoWriter('luta.avi', fourcc, 60,(256, 224))

for frame in frames:
	imgBase = Image.open(BytesIO(base64.b64decode(frame[1])))
	img = np.array(imgBase)[:,:,[2,1,0]]
	cv2.imshow('frame', img)
	cv2.waitKey(2)
	writer.write(img.astype(np.uint8))