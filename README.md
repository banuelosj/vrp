# Vehicle Routing Problem Tester and Visualizer
This project allows users to test the Vehicle Routing Problem service from the REST endpoint, by providing a familiar UI. This JavaScript application allows users to pass in their parameters that they would normally pass, but with more control. This application will also display the route on a separate Map.

<img src="vrpScreenshot.png" width="600"/>

## Getting Started
The src folder is ready for deployment. This application is using an ArcGIS Online generated proxy, that has been configured to only work with the "esri.com" domain. (See [ArcGIS Online Hosted Proxy](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/working-with-proxies/) documentation page for more details). Thus, any external users would need to modify the vrpServiceUrl variable in the app.js file to point to the Vehicle Routing Problem SErvice.

## How to use the sample
Run the application. Initially you will see the option to choose either the public [sampleserver6 vrp service](https://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/GPServer/SolveVehicleRoutingProblem) or the ArcGIS Online Vehicle Routing Problem service. Select whichever one to start testing. The sampleserver6 service only has a dataset from San Diego, so any data outside of San Diego will fail. When using the VRP service, you can use the [REST API](https://developers.arcgis.com/rest/network/api-reference/vehicle-routing-problem-service.htm) to understand what parameters you can pass into the service, and how to pass them.

There is a "Sample Data" link underneath the service options where you can copy and paste the orders, depots, and routes (required fields) for testing. After copying and pasting the sample data, you can scroll down to the "Solve Route (POST)" button, and click on the button to send the request. There will be text underneath the button demonstrating the current status of the job, and it will display an error message if it fails, or success if it works.

Next, the map will display the route graphic, and zoom to the graphic.

## Deployment
One can deploy the application over a local web server (example: IIS).

## Built With

* [ArcGIS JavaScript API](https://developers.arcgis.com/javascript/) - Using the 4.11 JavaScript API
* [ArcGIS REST API](https://developers.arcgis.com/rest/network/api-reference/vehicle-routing-problem-service.htm)

## Relevant API
* Map
* MapView
* FeatureLayer
* Polyline
* SpatialReference
* Graphic
* GraphicsLayer