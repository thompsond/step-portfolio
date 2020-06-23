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

package com.google.sps;

import java.util.Collection;
import java.util.ArrayList;
import java.util.Arrays;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    Collection<TimeRange> options = new ArrayList<>();
    Collection<TimeRange> optionsWithOptional = new ArrayList<>();
    if(request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
        return options;
    }
    int currentAvailableStart = TimeRange.START_OF_DAY;
    int currentAvailableEnd = TimeRange.END_OF_DAY;
    TimeRange currentAvailableRange = TimeRange.fromStartEnd(currentAvailableStart, currentAvailableEnd, true);
    int currentAvailableStartOptional = TimeRange.START_OF_DAY;
    int currentAvailableEndOptional = TimeRange.END_OF_DAY;
    TimeRange currentAvailableRangeOptional = TimeRange.fromStartEnd(currentAvailableStartOptional, currentAvailableEndOptional, true);
    for(Event event : events) {
        Collection<String> eventAttendees = event.getAttendees();
        Collection<String> requiredAttendees = request.getAttendees();
        Collection<String> optionalAttendees = request.getOptionalAttendees();
        boolean isMandatory = eventAttendees.stream().anyMatch(attendee1 -> requiredAttendees.stream().anyMatch(attendee2 -> attendee1.equals(attendee2)));
        boolean notAttending = !isMandatory && !eventAttendees.stream().anyMatch(attendee1 -> optionalAttendees.stream().anyMatch(attendee2 -> attendee1.equals(attendee2)));

        // If the event does not contain any requested attendees, go to the next event
        if(notAttending) continue;

        if(event.getWhen().equals(TimeRange.WHOLE_DAY) && !isMandatory) {
            currentAvailableRangeOptional = null;
        }
        if(currentAvailableRangeOptional != null) {
            // If the event starts at the same time as current available start, make the current available start the end of the event
            if(event.getWhen().start() == currentAvailableStartOptional) {
                currentAvailableStartOptional = event.getWhen().end();
                currentAvailableRangeOptional = TimeRange.fromStartEnd(currentAvailableStartOptional, currentAvailableEndOptional, true);
            }

            // If the current event is during the current start and end, split the times
            if(currentAvailableRangeOptional.contains(event.getWhen())) {
                currentAvailableRangeOptional = TimeRange.fromStartEnd(currentAvailableStartOptional, event.getWhen().start(), false);
                // If the gap between the current available start and the duration of the requested meeting is long enough, add it to the options
                if( (event.getWhen().start() - request.getDuration()) >= currentAvailableStartOptional ) {
                    optionsWithOptional.add(currentAvailableRangeOptional);
                }
                currentAvailableStartOptional = event.getWhen().end();
                currentAvailableRangeOptional = TimeRange.fromStartEnd(currentAvailableStartOptional, currentAvailableEndOptional, true);
                // If the event goes to the end of the day, there is no more possible time
                if(currentAvailableRangeOptional.equals(event.getWhen()) || currentAvailableRangeOptional.duration() == 0) {
                    currentAvailableStartOptional = 0;
                    currentAvailableEndOptional = 0;
                }
            }

            // If the events overlap, start at the end of the event
            if(event.getWhen().overlaps(TimeRange.fromStartEnd(currentAvailableStartOptional, currentAvailableEndOptional, true))) {
                currentAvailableStartOptional = event.getWhen().end();
            }
        }

        if(isMandatory) {
            if(event.getWhen().equals(TimeRange.WHOLE_DAY)) {
                currentAvailableRange = null;
            }
            if(currentAvailableRange != null) {
                // If the event starts at the same time as current available start, make the current available start the end of the event
                if(event.getWhen().start() == currentAvailableStart) {
                    currentAvailableStart = event.getWhen().end();
                    currentAvailableRange = TimeRange.fromStartEnd(currentAvailableStart, currentAvailableEnd, true);
                }

                // If the current event is during the current start and end, split the times
                if(currentAvailableRange.contains(event.getWhen())) {
                    currentAvailableRange = TimeRange.fromStartEnd(currentAvailableStart, event.getWhen().start(), false);
                    // If the gap between the current available start and the duration of the requested meeting is long enough, add it to the options
                    if( (event.getWhen().start() - request.getDuration()) >= currentAvailableStart ) {
                        options.add(currentAvailableRange);
                    }
                    currentAvailableStart = event.getWhen().end();
                    currentAvailableRange = TimeRange.fromStartEnd(currentAvailableStart, currentAvailableEnd, true);
                    // If the event goes to the end of the day, there is no more possible time
                    if(currentAvailableRange.equals(event.getWhen()) || currentAvailableRange.duration() == 0) {
                        currentAvailableStart = 0;
                        currentAvailableEnd = 0;
                    }
                }

                // If the events overlap, start at the end of the event
                if(event.getWhen().overlaps(TimeRange.fromStartEnd(currentAvailableStart, currentAvailableEnd, true))) {
                    currentAvailableStart = event.getWhen().end();
                }
            }
        }
    }

    // Add last available range
    if((currentAvailableEndOptional - currentAvailableStartOptional) != 0 && currentAvailableRangeOptional != null) {
        optionsWithOptional.add(TimeRange.fromStartEnd(currentAvailableStartOptional, currentAvailableEndOptional, true));
    }

    if((currentAvailableEnd - currentAvailableStart) != 0 && currentAvailableRange != null && options.size() != 0) {
        options.add(TimeRange.fromStartEnd(currentAvailableStart, currentAvailableEnd, true));
    }

    return optionsWithOptional.size() >= 1 ? optionsWithOptional : options;
  }
}
