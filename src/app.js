/** 
 * javascript code for the vrp service app
 * this sample uses the ArcGIS JavaScript API 
 * end goal is to build this with NodeJS, Babel, and the esriLoader
**/
require([
  "esri/views/MapView",
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/geometry/Polyline",
  "esri/geometry/SpatialReference",
  "esri/Graphic",
  "esri/layers/GraphicsLayer"
],
function(
  MapView, Map, FeatureLayer, Polyline, SpatialReference, Graphic, GraphicsLayer
) {

  let routeJson;
  let serviceUrl;
  const spatialRef = new SpatialReference({wkid: 4326});
  const vrpServiceUrl = "https://utility.arcgis.com/usrsvcs/appservices/SZhm4KVfLqLVXOJJ/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem";

  //using San Diego sampleserver6
  const sdVrpServiceUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/GPServer/SolveVehicleRoutingProblem";

  const resultNode = document.getElementById("result");
  const form = document.getElementById("theForm");
  const clearButton = document.getElementById("clearRoutesButton");
  clearButton.onclick = function(){clearRoutes()};

  //set up an event listener for the form submit event
  const hanndleFormSubmit = (evt)=>{
      //stop the form from submitting so we can just grab the data
      evt.preventDefault();

      const data = formToJSON_deconstructed(form.elements);

      let bodyStringFromForm = Object.keys(data).map(function(item){
          return encodeURIComponent(item) + "=" + encodeURIComponent(data[item]);
      }).join("&");

      postReqFromForm(bodyStringFromForm);
  }

  //add the event listener to the form
  form.addEventListener('submit', hanndleFormSubmit);

  //grab the values from the form fields
  //retrieves input data from a form and returns it as a json object
  //this function constructs the object
  const formToJSON_deconstructed = (elements)=>{
      //reducer function
      //function called on eac element fo the array
      const reducerFunction = (data, element) =>{
          if(isValidElement(element)){
              data[element.name] = element.value;
          }       
          return data;
      }

      //initial value of data
      const reducerInitialValue = {};

      //reduce by calling array.prototype.reduce() on elements
      const formData = [].reduce.call(elements, reducerFunction, reducerInitialValue);

      return formData;
  }

  //shorthand notation of formToJSON_deconstructed above
  /*const formToJSON = (elements)=> [].reduce.call(elements, (data, element) =>{
      data[element.name] = element.value; //adding the key and value pair to the object
      return data;
  }, {});
  */

  //checks that an element has a non-empty name and value property
  const isValidElement = (element)=>{
      return element.name && element.value;
  }

  //submitting the request from the form parameters
  function postReqFromForm(bodyParams){
      let counter = 0; //make sure only one request is sent.

      serviceUrl = chooseVrpService();
      let requestUrl = serviceUrl + "/submitJob?f=json";

      let request = new XMLHttpRequest();
      request.open("POST", requestUrl, true);
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      request.send(bodyParams);

      request.onreadystatechange = function(){
          if(this.status == 200 && request.responseText.length > 1){
              counter += 1;
              if(counter < 2){
                  let requestJson = JSON.parse(request.responseText);
                  checkJobStatus(requestJson.jobId); //pass in a json object instead of a string;
              }
          }
      }
  }

  function checkJobStatus(jobId){
      let checkJobUrl = serviceUrl + '/jobs/' + jobId +'?f=json';
      let status;
      let result;

      //using fetch to return the job status
      fetch(checkJobUrl)
          .then(function(response){
              result = response;
              return response.json();  
          })
          .then(function(json){
              status = json.jobStatus;
              console.log(status);
              resultNode.innerHTML = status
              switch(status){
                  case 'esriJobSubmitted':
                      checkJobStatus(jobId); //keep checking the job status
                      break;
                  case 'esriJobExecuting':
                      checkJobStatus(jobId); //keep checking the job status
                      break;
                  case 'esriJobSucceeded':
                      console.log("success: ", result);
                      console.log("json", json);
                      populateResults(json);
                      returnRoutes(jobId);
                      break;
                  default:
                      //this json will return the error message
                      console.log("failed because: ", json);
                      populateResults(json);
                      break;
              }
          })
          .catch(function(err){
              console.log("failed with to fetch job status: ", err);
          });
  }

  //returns the routes from the successfull response
  function returnRoutes(jobId){
      //construct the url with the job id
      let checkJobUrl = serviceUrl + '/jobs/' + jobId +'/results/out_routes?f=json';

      fetch(checkJobUrl)
          .then(function(response){
              return response.json();  
          })
          .then(function(json){
              console.log("output", json);
              routeJson = json;
              displayRoute(json.value);
          })
          .catch(function(err){
              console.log("failed to return route with: ", err);
          });
  }

  //this function returns whether to use the sampleserver6 or
  //arcgis online vrp service for testing
  function chooseVrpService(){
      const sampleserver6Radio = document.getElementById("sampleServerRadio");
      if(sampleserver6Radio.checked){
          //use sampleserver6 vrp service
          return sdVrpServiceUrl;
      }
      else{
          return vrpServiceUrl;
      }
  }

  //code for adding the Map to the application
  const map = new Map({
      basemap: "streets"
  });

  let view = new MapView({
      container: "viewDiv",
      map: map
  });

  let graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  view.ui.add("clearRoutesButton", "bottom-left");

  view.when(function(){
      view.goTo({
          center: [-96.24023437499999, 38.393338888322376],
          scale: 50000000
      });
  })

  function displayRoute(featureSet){
      console.log("featureSet: ", featureSet);
      //renderer for the routes
      let renderer = {
          type: "simple",
          symbol: { 
              type: "simple-line",
              color: [0, 255, 0],
              width: 4
          }
      };

      //logistics vrp service will have a blue polyline
      if(serviceUrl.includes("https://logistics.arcgis.com")){
          renderer.symbol.color = [0, 0, 255];
      }

      let source = createPolylinesFromPaths(featureSet.features, renderer.symbol);
      graphicsLayer.addMany(source);

      view.goTo(source);
      //show clear button
      clearButton.style.visibility = "visible";
  }

  //function to create Polylines from the geometry paths of the features
  //otherwise there is an error when creating the featurelayer
  //Accessor#set Invalid property value, value needs to be one of 'esri.geometry.Extent', 'esri.geometry.Multipoint', 'esri.geometry.Point', 'esri.geometry.Polyline', 
  //'esri.geometry.Polygon', or a plain object that can autocast (having .type = 'extent', 'multipoint', 'point', 'polyline', 'polygon'
  function createPolylinesFromPaths(features, symbol){
      let graphics = [];

      features.forEach(function(feature){
          //check to make sure the features have a geometry property as well
          if(feature.geometry){
              let polyline = new Polyline({
                  //paths: feature.geometry.paths[0],
                  paths: feature.geometry.paths,
                  spatialReference: spatialRef
              });

              let graphic = new Graphic({
                  attributes: feature.attributes,
                  geometry: polyline,
                  symbol: symbol
              });

              graphics.push(graphic);
          }
      });

      if(graphics.length > 0){
          return graphics;
      }
      else{
          console.log("failed to create polylines from paths as graphics array is empty");
      }
      
  }

  //function to remove any graphics on the existing map
  function clearRoutes(){
      graphicsLayer.removeAll();
  }

  //populate the result for job succeeded or failed
  function populateResults(result){
      resultNode.innerHTML = result.jobStatus;
      //check if there are any warning messages, and print them out.
      if(result.jobStatus === "esriJobFailed"){
          //go through each message and find the first messagetype error
          //can't use for each since you can't break from it
          for(let i = 0; i < result.messages.length; i++){
              if(result.messages[i].type === "esriJobMessageTypeError"){
                  resultNode.innerHTML = `
                      <p>${result.jobStatus}<br>Failed: ${result.messages[i].description}</p>
                  `;
                  break;
              }
          }
          
      }
      else if(result.messages.length > 0){ //check if there are any messages if it does not fail
          resultNode.innerHTML = `
              <p>${result.jobStatus}<br>Warning: ${result.messages[0].description}</p>
          `;
      }
  }

});
