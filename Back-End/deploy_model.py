from tensorflow import keras
from flask import Flask, request, render_template, jsonify
import cv2
import numpy as np

# load model dan label
modelpath = 'model/94_93.h5'
labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
model = keras.models.load_model(modelpath)


def crop_image(img):
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
    face_bb = face_cascade.detectMultiScale(gray_img, 1.1, 4)
    if len(face_bb) == 0:
        return None
    x, y, w, h = face_bb[0]
    crop_img = img[y:y + h, x:x + w]

    return crop_img


def preprocessing_image(crop_image):
    # img = image.load_img(imagepath,target_size = (48,48),color_mode = "grayscale")
    img = cv2.cvtColor(crop_image, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (48, 48))
    # print(img.shape)
    # print(type(img))
    img = cv2.normalize(img, None, alpha=0, beta=1,
                        norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    img = np.expand_dims(img, axis=0)
    return img


def predict_emotion(prep_img):
    result = model.predict(prep_img)
    return result


def single_predict(img):
    img = crop_image(img)
    if img is None:
        return None

    img = preprocessing_image(img)
    result = predict_emotion(img)
    # img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # result = img.shape
    return result


def summary_predict(predicts: list) -> dict:
    summary = dict(zip(labels, np.zeros(7)))
    len_predict = len(predicts)
    for predict in predicts:
        for label in labels:
            summary[label] += predict['predict'][label]
    summary = {key: summary[key] / len_predict for key in summary}
    return summary


app = Flask("__name__")


@app.route('/api/predict', methods=['POST'])
def predictEmotion():
    predicts = []
    file_images = request.files.getlist('image')
    total_images = len(file_images)
    for file_image in file_images:
        name = file_image.filename
        npimg = np.fromfile(file_image, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        temp_predict = single_predict(img)
        temp_predict = np.array(
            [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]) if temp_predict is None else temp_predict
        dict_predict = dict(zip(labels, temp_predict[0].tolist()))
        predict = {
            'name': name,
            'predict': dict_predict
        }
        predicts.append(predict)
    summary = summary_predict(predicts)
    result = {
        'predictions': predicts,
        'summary': summary
    }
    return jsonify(result)


if __name__ == '__main__':
    app.run(port=5000, debug=True)
