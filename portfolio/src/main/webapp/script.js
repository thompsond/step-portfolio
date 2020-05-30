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

    // Hide the dialog window when the website link is clicked
    $("#message a").click(function(event) {
        $("#dialog").hide();
    });

});

