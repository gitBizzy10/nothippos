import React from 'react';
import InputBar from './InputBar.jsx';
import Displayed from './Display.jsx';
import TopBar from './TopBar.jsx';
import Hidden from './Hidden.jsx';
import EditPlanDisplay from './EditPlanDisplay.jsx';
import axios from 'axios';
import querystring from 'querystring';
import style from './style.css';
import {
  withScriptjs,
  withGoogleMap,
  withPolyline,
  GoogleMap,
  Marker,
  Polyline
} from "react-google-maps";
var polyCoordinates = [];

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCities: [],
      tags: '',
      currentEditCity: {
        events: []
      },
      savedTags: [],
      cityMarkers: [],
      coords:[],
      polyCoordinates: []
    }
    this.addCity = this.addCity.bind(this);
    this.addTags = this.addTags.bind(this);
    this.tagClicked = this.tagClicked.bind(this);
    this.saveNewTrips = this.saveNewTrips.bind(this);
    this.changeCurrentEditCity = this.changeCurrentEditCity.bind(this);
    this.createNewEvent = this.createNewEvent.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.changeCityMarkers = this.changeCityMarkers.bind(this);
  }

  changeCityMarkers (location, position) {
    var newMarker = {
      cityName: location,
      position: position
    }
    var currentMarkers = this.state.cityMarkers;
    currentMarkers.push(newMarker);
    //pushes position to an array in order to render polyLine later
    polyCoordinates.push(position);
    this.setState({
      cityMarkers: currentMarkers,
      coords: polyCoordinates
    })
  }

  componentDidMount() {
    axios.get('/api/tagList')
      .then(res => {
        this.setState({
          savedTags: res.data
      })
    })
  }

  changeCurrentEditCity (idx) {
    var temp = this.state.currentCities[idx];
    this.setState ({
      currentEditCity: temp
    })
  }

  createNewEvent () {
    var newEvent = {
      activityName: 'Click To Edit New Event',
      date: '',
      time: '',
      location: '',
      notes: '',
    }
    var tempCurrentEditCity = this.state.currentEditCity;
    var tempEvents = tempCurrentEditCity.events;
    tempEvents.push(newEvent);
    tempCurrentEditCity.events = tempEvents;
    this.setState ({
      currentEditCity: tempCurrentEditCity
    })
  }

  saveEvent (idx, activityName, date, time, location, notes) {
    var cityToEdit = this.state.currentEditCity;
    var eventsToEdit = cityToEdit.events;
    var eventEditChanges = {
      activityName: activityName,
      date: date,
      time: time,
      location: location,
      notes: notes
    };
    eventsToEdit[idx] = eventEditChanges;
    eventsToEdit.sort(function(a,b) {
      if (a.date < b.date) {
        return -1;
      } else if (a.date > b.date) {
        return 1;
      } else {
        if (a.time < b.time) {
          return -1;
        } else {
          return 1;
        }
      }
    })
    cityToEdit.events = eventsToEdit;
    var city = {
      locationName: cityToEdit.locationName,
      dateOfArrival: cityToEdit.dateOfArrival,
      dateOfDeparture: cityToEdit.dateOfDeparture,
      events: eventsToEdit
    }
    this.setState ({
      currentEditCity: city
    })

  }

  addCity (locationName, dateOfArrival, dateOfDeparture, latLng) {
    var city = {
      locationName: locationName,
      dateOfArrival: dateOfArrival,
      dateOfDeparture: dateOfDeparture,
      latLng: latLng,
      events: [
        {
          activityName: 'Arrival',
          date: dateOfArrival,
          time: '',
          location: locationName,
          notes: '',
        },
        {
          activityName: 'Departure',
          date: dateOfDeparture,
          time: '',
          location: locationName,
          notes: '',
        }
      ]
    }
    var tempCities = this.state.currentCities;
    tempCities.push(city);
    this.setState ({
      currentCities: tempCities
    })
  }

  addTags (tripName) {
    this.setState ({
      tags: tripName
    })
  }

  saveNewTrips() {
    var atag = this.state.tags;
    var current = this.state.currentCities;
    axios({
      method: "POST",
      url: "/api/saveNewTrip",
      data: {
        tags: atag,
        currentCities: current
      }
    });
    axios.get('/api/tagList')
      .then(res => {
        this.setState({
          savedTags: res.data
      })
    })
    this.saveToSavedTags(atag);
  }

  saveToSavedTags(tag) {
    this.state.savedTags.push(tag);
  }

  tagClicked(clickedit) {
    axios({
      method: "get",
      url: "/api/savedTrips",
      params:{
        tag: clickedit
      }
    })
    .then(res => {
      var temp = [];
      var tempObj = {};
      for (var i = 0; i < res.data.length; i++) {
        tempObj.locationName = res.data.cityName;
        tempObj.dateOfArrival = res.data.dateOfArrival;
        tempObj.dateOfDeparture = res.data.dateOfDeparture;
        temp.push(tempObj)
      }
      this.setState({
        currentCities: temp,
        tags: clickedit
      })
    })
  }

  render() {
    return (
      <div>
        <InputBar changeCityMarkers={this.changeCityMarkers} addCityToParent={this.addCity} addTagsToParent={this.addTags}
          saveNewTrips={this.saveNewTrips} currentCities={this.state.currentCities} changeCurrentEditCity={this.changeCurrentEditCity}
          />
        <EditPlanDisplay coords={this.state.coords} cityMarkers={this.state.cityMarkers} saveEvent={this.saveEvent} createNewEvent={this.createNewEvent} savedTags={this.state.savedTags} tagClicked={this.tagClicked} currentEditCity={this.state.currentEditCity}/>
      </div>
    )
  }
}
