/**
 * Google Apps Script for Beads Land Studio Booking
 * Optimized with Hourly Capacity Check and Concurrency Locking
 */

const CAPACITY_LIMIT = 18; // Global capacity limit

function doGet(e) {
  var dateStr = e.parameter.date;
  if (!dateStr) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'No date provided'})).setMimeType(ContentService.MimeType.JSON);
  
  var calendarId = 'primary'; 
  var calendar = CalendarApp.getCalendarById(calendarId);
  
  // Start and end of the requested day
  var dayStart = new Date(dateStr + 'T00:00:00');
  var dayEnd = new Date(dateStr + 'T23:59:59');
  
  var events = calendar.getEvents(dayStart, dayEnd);
  var hourlyOccupancy = {};
  
  // Initialize hours 12:00 to 21:00 (Business Hours)
  for (var i = 12; i <= 21; i++) {
    hourlyOccupancy[i + ':00'] = 0;
  }
  
  events.forEach(function(event) {
    var match = event.getTitle().match(/\((\d+)人\)/);
    if (match) {
      var people = parseInt(match[1]);
      var eventStart = event.getStartTime();
      var eventEnd = event.getEndTime();
      
      // Check every hour slot for overlap
      for (var h = 12; h <= 21; h++) {
        var slotStart = new Date(dateStr + 'T' + (h < 10 ? '0'+h : h) + ':00:00');
        var slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
        
        if (eventStart < slotEnd && eventEnd > slotStart) {
          hourlyOccupancy[h + ':00'] += people;
        }
      }
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    occupancy: hourlyOccupancy,
    limit: CAPACITY_LIMIT
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // 1. Acquire Lock (wait up to 30 seconds)
    lock.waitLock(30000);
    
    var data = JSON.parse(e.postData.contents);
    var calendarId = 'primary'; 
    var calendar = CalendarApp.getCalendarById(calendarId);
    
    // 2. Parse New Booking Times
    var dateStr = data.date; // YYYY-MM-DD
    var startDateTime = new Date(dateStr + 'T' + data.startTime);
    var durationHours = parseFloat(data.duration);
    var endDateTime = new Date(startDateTime.getTime() + (durationHours * 60 * 60 * 1000));
    var newBookingCount = parseInt(data.people);

    // 3. Hourly Capacity Check
    // We check every 1-hour slot that this booking touches
    var startHour = startDateTime.getHours();
    var endHour = Math.ceil((endDateTime.getTime() - new Date(dateStr + 'T00:00:00').getTime()) / (3600000)) - 1;
    
    // Fetch all events for this day to calculate current occupancy accurately
    var dayEvents = calendar.getEvents(new Date(dateStr + 'T00:00:00'), new Date(dateStr + 'T23:59:59'));
    
    for (var h = startHour; h <= endHour; h++) {
      var slotStart = new Date(dateStr + 'T' + (h < 10 ? '0'+h : h) + ':00:00');
      var slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
      
      // Only check if the slot overlaps with our requested booking time
      if (startDateTime < slotEnd && endDateTime > slotStart) {
        var currentOccupancyForHour = 0;
        
        dayEvents.forEach(function(event) {
          var match = event.getTitle().match(/\((\d+)人\)/);
          if (match) {
            var eStart = event.getStartTime();
            var eEnd = event.getEndTime();
            // If this existing event overlaps with the current hour slot being checked
            if (eStart < slotEnd && eEnd > slotStart) {
              currentOccupancyForHour += parseInt(match[1]);
            }
          }
        });
        
        // If adding new people exceeds limit in THIS hour
        if (currentOccupancyForHour + newBookingCount > CAPACITY_LIMIT) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            code: 'SLOT_FULL',
            message: '抱歉，' + h + ':00 时段名额不足。剩余名 Error: Slot full at ' + h + ':00',
            remaining: Math.max(0, CAPACITY_LIMIT - currentOccupancyForHour)
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // 4. Create Calendar Event
    var summary = '预约: ' + data.name + ' (' + data.people + '人)';
    var description = '服务: ' + (data.service || 'Session') + 
                      '\n人数: ' + data.people + 
                      '\n电话: ' + data.phone + 
                      '\n邮箱: ' + data.email +
                      '\n备注: ' + (data.notes || '无');
    
    var event = calendar.createEvent(summary, startDateTime, endDateTime, {
      description: description,
      location: 'Beads Land Studio',
      guests: data.email,
      sendInvites: true
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      eventId: event.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '系统错误: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    // 5. Always Release Lock
    lock.releaseLock();
  }
}
