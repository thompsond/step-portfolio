// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

$(document).ready(function() {
    // Create the text for the copyright information
    let date = new Date();
    let year = date.getFullYear();
    $("#copyright").html(`&copy; ${year} Darren Thompson`);

    // Use the height of the header/navigation to create an
    // offset of the main content
    let $height = $("header").outerHeight(true);
    $("#main-container").css("margin-top", `${$height + 30 + "px"}`);

    // Calculate the threshold for the scroll dialog
    let threshold = $(document).height() * 0.1;
    let didShowDialog = false;

    // When the user crosses the specified threshold
    // show a dialog with a link to my personal site. 
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() > $(document).height() - threshold && !didShowDialog) {
            $("#dialog").show();
            // Additionally the boolean is used to make sure
            // the dialog is only shown once
            didShowDialog = true;
        }
    });

    // Hide the dialog window when the user clicks the link or clicks outside of the dialog
    $("#dialog").click(function(event) {
        if(event.target.id !== "message") {
            $(this).hide();
        }
    });

    // Helper function to create a new page and link for comments
    function createNewPage(pageNumber) {
        let id = `page${pageNumber}`;
        // Add the page to the DOM
        $("#comment-section").append(`<div id="${id}" class="page"></div>`);
        // Add the page number to the DOM
        $("#page-number-container").append(`<a href="#${id}" class="page-number">${pageNumber}</a>`);
    }

    function getComments() {
        let $max = parseInt($("#comment-range-select").val());
        fetch(`/data`).then(response => response.json()).then(data => {
            $("#comment-section").empty();
            $("#page-number-container").empty();
            if(data.length !== 0) {
                let currentPageCount = 1;
                let numOfCommentsOnCurrentPage = 0;
                createNewPage(currentPageCount);
                for(index in data) {
                    // Limit each page to the number of comments specified by the user
                    if(numOfCommentsOnCurrentPage === $max) {
                        createNewPage(++currentPageCount);
                        numOfCommentsOnCurrentPage = 0;
                    }
                    let comment = data[index].message;
                    let imageUrl = data[index].imageUrl;
                    // Add the current comment to the current page
                    $(`div#page${currentPageCount}`).append(`<p class="comment">${comment}</p>`);
                    if(imageUrl !== "") $(`div#page${currentPageCount}`).append(`<img src="${imageUrl}" class="comment-pic">`);
                    numOfCommentsOnCurrentPage++;
                }
                // Select the first page
                $(".page-number[href='#page1']").addClass("selected").click();
            }
        });
    }

    // Get comments on load
    getComments();
    
    // Get comments when the selected option changes
    $("#comment-range-select").change(function(event) {
        getComments();
    });

    $("#delete-comments-btn").click(function(event) {
        const request = new Request('/delete-data', { method: "POST" });
        fetch(request);
        setTimeout(() => { getComments(); }, 1700);
    });

    // Show the corresponding page when a page number is clicked
    $("#page-number-container").on("click", ".page-number", function(event) {
        event.preventDefault();
        // Hide all of the pages
        $(".page").hide();
        $(".page-number").removeClass("selected");
        let $page = $(this).attr("href");
        $(`${$page}`).show();
        $(this).addClass("selected");
    });

    // Create map
    const map = new google.maps.Map(
      document.getElementById('map'),
      { center: { lat: 33.988897, lng: -84.539020 }, zoom: 12, mapTypeId: 'satellite' });

    let schoolMarker = new google.maps.Marker({
        map: map,
        position: { lat: 34.017780, lng: -84.564023 },
        title: "Town Center Mall"
    });

    let kennesawMountain = new google.maps.Marker({
        map: map,
        position: { lat: 33.971292, lng: -84.582371 },
        title: "Kennesaw Mountain"
    });

    let movieTheater = new google.maps.Marker({
        map: map,
        position: { lat: 33.948931, lng: -84.514641 },
        title: "Studio Movie Grill"
    });

    var infowindow = new google.maps.InfoWindow({
        content: `<p>SMG Marietta is located off of Powers Ferry Road Southeast and Roswell Road in Marietta, Georgia. 
            This location will feature 1,285 luxury lounge chairs and recliners in 11 auditoriums outfitted with the latest digital projection, 
            Dolby 3D, Q-SYS custom sound systems, 
            as well as a full-service bar and lounge and made-to-order American Grill menu.
            The SMG Marietta box office opens one hour before the first scheduled movie of the 
            day and closes 15 minutes after the start of the last scheduled showtime.</p>`
    });

    movieTheater.addListener('click', function() {
        infowindow.open(map, movieTheater);
    });

    let waffleHouse = new google.maps.Marker({
        map: map,
        position: { lat: 33.998205, lng: -84.529485 },
        title: "Waffle House"
    });

    // Get the other markers from the server
    fetch("/add-markers").then(response => response.json()).then(data => {
        for(index in data) {
            new google.maps.Marker({
                map: map,
                position: { 
                    lat: data[index].latitude,
                    lng: data[index].longitude
                },
                title: data[index].title
            });
        }
    });

    // Create polygon with some of the marker coordinates
    let polygonCoords = [
        { lat: 34.017780, lng: -84.564023 },
        { lat: 33.971292, lng: -84.582371 },
        { lat: 33.952719, lng: -84.549583 },
        { lat: 33.998205, lng: -84.529485 }
    ];

    let polygon = new google.maps.Polygon({
        paths: polygonCoords,
        strokeColor: '#72B332',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#72B332',
        fillOpacity: 0.35,
        map: map
    });

    // Add circle
    let cityCircle = new google.maps.Circle({
      strokeColor: '#3232B3',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3232B3',
      fillOpacity: 0.35,
      map: map,
      center: { lat: 33.948931, lng: -84.514641 },
      radius: 2800
    });

    // Get Blobstore URL
    fetch("/blobstore-upload-url").then(response => response.text()).then(uploadURL => {
        $("#comment-form").attr("action", uploadURL);
    });
});
