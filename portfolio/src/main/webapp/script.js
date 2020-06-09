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
                    // Add the current comment to the current page
                    $(`div#page${currentPageCount}`).append(`<p class="comment">${comment}</p>`);
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
      { center: { lat: 33.998897, lng: -84.543732 }, zoom: 12, mapTypeId: 'satellite' });

    let schoolMarker = new google.maps.Marker({
        map: map,
        position: { lat: 34.038090, lng: -84.583095 },
        title: "Kennesaw State University"
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

    let waffleHouse = new google.maps.Marker({
        map: map,
        position: { lat: 33.998205, lng: -84.529485 },
        title: "Waffle House"
    });
});
