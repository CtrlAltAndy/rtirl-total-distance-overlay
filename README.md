## rtirl-total-distance-overlay

Custom overlay for RealtimeIRL total distance, daily distance and speed. Saves distance data to Google firestore, should be covered by the free tier but charges may apply.

Overlay with default styling:

![image](https://github.com/CtrlAltAndy/rtirl-total-distance-overlay/assets/139385528/438cb6cb-e203-4f8d-9462-da35648077fe)

## Adding as a StreamElements overlay

### 1. Add a Custom widget
![image](https://user-images.githubusercontent.com/33045386/170847810-955cc295-b973-4cbf-a2b3-e746b55a7c12.png)

### 2. Open editor
![image](https://user-images.githubusercontent.com/33045386/170847822-740dc34a-3c5d-44d0-a761-61de5124b5cc.png)

### 3. Copy content to correct sections
![image](https://user-images.githubusercontent.com/33045386/170847832-70ea6475-f83e-4b89-8287-59493656e2ca.png)

[html](https://github.com/atarvainen/rtirl-total-distance-overlay/blob/main/widgetHtml.html), [css](https://github.com/atarvainen/rtirl-total-distance-overlay/blob/main/widgetStyles.css), [js](https://github.com/atarvainen/rtirl-total-distance-overlay/blob/main/widgetJs.js) and [fields](https://github.com/atarvainen/rtirl-total-distance-overlay/blob/main/fields.json).

### 4. Add your pull key
Replace `pullKey` in the widget js section with your own RealtimeIRL pull key.

![image](https://user-images.githubusercontent.com/33045386/170848061-c160c46a-2efd-4c35-aef0-44f15c9058cd.png)

![image](https://user-images.githubusercontent.com/33045386/170848075-9dfc9014-e21c-4103-b8ad-44bd458a7866.png)


### 5. Create a Cloud Firestore
Create a Cloud Firestore and replace the `firebaseConfig` in widget js with your own config.

![image](https://user-images.githubusercontent.com/33045386/170848080-2beabff9-32e1-4117-9c8b-fec91bcfa15d.png)

Consult a tutorial if you're unfamiliar with firebase e.g. [https://dev.to/napoleon039/how-to-create-a-new-firestore-database-4o25](https://dev.to/napoleon039/how-to-create-a-new-firestore-database-4o25)

## Customization

Use the provided customization options in the Streamelements settings panel. For more advanced customization edit the css section.

