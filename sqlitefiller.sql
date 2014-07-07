create table agency(agency_id TEXT,agency_name TEXT,agency_url TEXT,
                    agency_timezone TEXT,agency_lang TEXT, agency_phone TEXT);
create table calendar_dates(service_id TEXT,date NUMERIC,exception_type NUMERIC);
create table routes(route_id TEXT,agency_id TEXT,route_short_name TEXT,
                    route_long_name TEXT,route_desc TEXT,route_type NUMERIC,
                    route_url TEXT,route_color TEXT,route_text_color TEXT);
create table shapes(shape_id TEXT,shape_pt_lat REAL,shape_pt_lon REAL,
                    shape_pt_sequence NUMERIC);
create table stops(stop_id TEXT,stop_code TEXT,stop_name TEXT,
                   stop_lat REAL,stop_lon REAL,
                   stop_url TEXT,timepoint NUMERIC);
create table stop_times(trip_id TEXT,arrival_time TEXT,departure_time TEXT,
                        stop_id TEXT,stop_sequence NUMERIC,stop_headsign TEXT,
                        pickup_type NUMERIC,drop_off_type NUMERIC);
create table trips(route_id TEXT,service_id TEXT,trip_id TEXT,
                   trip_headsign TEXT,direction_id NUMERIC,
                   block_id TEXT,shape_id TEXT);

agency.txt 
  agency_id (1,2,3..)
  agency_name (strings)
  agency_url
  agency_phone

calendar_dates.txt:
  service_id (ints)
  day (mon,tue..)

routes.txt:
  route_id
  agency_id
  route_short_name
  route_long_name
  route_url
  route_color
  route_text_color

shapes.txt:
  shape_id(int)
  shape_pt_lon
  shape_pt_lat
  shape_pt_sequence

stops.txt:
  stop_id(int)
  stop_name
  stop_lat
  stop_lon

stop_times.txt:
  trip_id(int)
  arrival_time
  departure_time
  stop_id
  stop_sequence

trips.txt:
  route_id
  service_id
  trip_id
  trip_headsign
  direction_id (0 or 1)
  shape_id

.separator ','
.import ./agency.txt agency
.import ./calendar_dates.txt calendar_dates
.import ./routes.txt routes
.import ./shapes.txt shapes
.import ./stops.txt stops
.import ./stop_times.txt stop_times
.import ./trips.txt trips
delete from agency where agency_id like 'agency_id';
delete from calendar_dates where service_id like 'service_id';
delete from routes where route_id like 'route_id';
delete from shapes where shape_id like 'shape_id';
delete from stops where stop_id like 'stop_id';
delete from stop_times where trip_id like 'trip_id';
delete from trips where route_id like 'route_id';

--query to get trips and arrival times for a given stop
--can filter down time intervals
select t.trip_headsign,st.arrival_time from trips t,stops s,stop_times st
where t.trip_id=st.trip_id
and s.stop_id=st.stop_id
and s.stop_name like 'Monticello Ave at Blenheim Ave Southbound';

--query to get stop names and coordinates and schedule for a given trip name
select distinct s.stop_name,s.stop_lat,s.stop_lon,st.arrival_time 
from stops s,stop_times st,trips t
where s.stop_id=st.stop_id
and st.trip_id=t.trip_id
and t.trip_headsign='Route 1 via Downtown Station' and t.trip_id=131 order by st.stop_sequence;

--full list of stops
select stop_name,stop_id from stops order by stop_name;

--query to get trip name,trip id for a given start and stop
--chespe is stop
select distinct t.trip_headsign,t.trip_id
from stops s,stop_times st,trips t
where s.stop_id=st.stop_id
and st.trip_id=t.trip_id
and t.trip_headsign=(select distinct ti.trip_headsign from trips ti,stops si,stop_times sti
where ti.trip_id=sti.trip_id
and si.stop_id=sti.stop_id
and si.stop_name like 'Chesapeake Street at 18th Street NE') and s.stop_name='Monticello Ave at Blenheim Ave Southbound';

--given a trip_id,start,stop names, find out all schedules;
select arrival_time from stop_times where trip_id=131 and stop_id=(select stop_id from stops where stop_name='Monticello Ave at Blenheim Ave Southbound');select arrival_time from stop_times where trip_id=131 and stop_id=(select stop_id from stops where stop_name='Chesapeake Street at 18th Street NE');


GTFS FIELDS: