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

package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.ArrayList;
import com.google.gson.Gson;

@WebServlet("/add-markers")
public class AddMarkers extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      List<Marker> markers = new ArrayList<>();
      markers.add(new Marker(33.969036, -84.538326, "Tip Top Donuts"));
      markers.add(new Marker(33.952719, -84.549583, "Marietta Square"));
      Gson gson = new Gson();
      String json = gson.toJson(markers);
      response.setContentType("application/json;");
      response.getWriter().println(json);
  }
}

class Marker {
    private double latitude;
    private double longitude;
    private String title;

    public Marker(double latitude, double longitude, String title) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.title = title;
    }

    public double getLatitude() { return latitude; }

    public double getLongitude() { return longitude; }

    public String getTitle() { return title; }
}
