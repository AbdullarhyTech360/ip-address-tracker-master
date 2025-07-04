"use client";
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import mobileBg from './assets/images/pattern-bg-mobile.png';
import desktopBg from './assets/images/pattern-bg-desktop.png';
import pointerIcon from './assets/images/icon-location.svg';


function App() {
  const [ipAddress, setIpAddress] = useState<string>('192.212.174.101');
  const [inputValue, setInputValue] = useState<string>('');
  const [latLng, setLatLng] = useState<{ lat: number, lng: number }>({ lat: 51.505, lng: -0.09 });
  const [locationData, setLocationData] = useState<{ ip: string, city: string, timezone: string, isp: string }>()
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);


  const customIcon = L.icon({
    iconUrl: pointerIcon,
    iconSize: [37, 47], // size of the icon    nslookup myip.opendns.com resolver1.opendns.com
    iconAnchor: [23, 56], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -56] // point from which the popup should open relative to the iconAnchor
  });
  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([latLng.lat, latLng.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      markerRef.current = L.marker([latLng.lat, latLng.lng], { icon: customIcon }).addTo(mapRef.current);
    }
  },);

  // Update marker and map view when latLng changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([latLng.lat, latLng.lng], 13);
      markerRef.current.setLatLng([latLng.lat, latLng.lng]);
      // Pan the map up by 100 pixels so the marker appears below center
      mapRef.current.panBy([0, -50]);
    }
  }, [latLng]);

  // Fetch location when IP changes
  useEffect(() => {
    async function fetchLocation() {
      const response = await fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=at_FPO3fDnjSZVDQTKx6wjHfAEGysQuj&ipAddress=${ipAddress}`);
      const data = await response.json();
      // // Update latLng state with fetched location
      if (data.location && data.location.lat && data.location.lng) {
        setLatLng({ lat: data.location.lat, lng: data.location.lng });
        setLocationData({
          ip: data.ip || ipAddress,
          city: data.location.city || 'Unknown',
          timezone: data.location.timezone || 'Unknown',
          isp: data.isp || 'Unknown'
        });
      }
    }
    fetchLocation();
  }, [ipAddress]);
  // Handle Enter key press in input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        setIpAddress(inputValue);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputValue]);
  return (
    <>
      <div className="relative h-[700px] md:h-screen w-full">
        {/* Header background */}
        <div className="h-[280px]">
          <img src={mobileBg} className='w-full h-full lg:hidden' alt="mobile bg" />
          <img className='hidden lg:block w-full h-full' src={desktopBg} alt="desktop bg" />
        </div>
        {/* Map fills the rest of the screen, but is capped on large screens */}
        <div
          className="absolute left-0 right-0 bottom-0 bg-black"
        style={{ top: 280 }}
        >
          <div
            id="map"
            className="
            h-full w-full z-40
            lg:max-h-[calc(100vh-280px)]
            lg:overflow-hidden
          "
          ></div>
        </div>
        {/* Overlay content */}
        <div className="absolute z-50 p-4 inset-0 mx-auto flex flex-col gap-y-6 lg:gap-y-12 mt-2 pointer-events-none">
          <h1 className='text-2xl font-[500] text-white text-center pointer-events-auto'>IP Address Tracker</h1>
          <div className="flex items-stretch justify-center align-center mx-auto max-w-[490px] w-full pointer-events-auto">
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Enter IP Address'
              className='border border-gray-300 p-4 rounded-l-xl w-full
            text-very-dark-gray outline-none lg:pl-6 text-lg'
            />
            <button
              onClick={() => {
                setIpAddress(inputValue);
              }}
              className='bg-black px-6 rounded-r-xl flex items-center'
              style={{ height: 'auto' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="14"><path fill="none" stroke="#FFF" strokeWidth="3" d="M2 1l6 6-6 6" /></svg>
            </button>
          </div>
          <div className="overlay-div">
            <div>
              <h3 className='font-semibold text-xs tracking-wide text-dark-gray'>IP ADDRESS</h3>
              <p className='text-lg font-[500] text-very-dark-gray'>{locationData?.ip}</p>
            </div>
            <div>
              <h3 className='font-semibold text-xs tracking-wide text-dark-gray'>LOCATION</h3>
              <p className='text-lg font-[500] text-very-dark-gray'>{locationData?.city || 'Unknown'}</p>
            </div>
            <div>
              <h3 className='font-semibold text-xs tracking-wide text-dark-gray'>TIMEZONE</h3>
              <p className='text-lg font-[500] text-very-dark-gray'>UTC{" " + locationData?.timezone || 'Unknown'}</p>
            </div>
            <div className='last:border-r-0'>
              <h3 className='font-semibold text-xs tracking-wide text-dark-gray'>ISP</h3>
              <p className='text-lg font-[500] text-very-dark-gray'>{locationData?.isp || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
