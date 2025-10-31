document.addEventListener("DOMContentLoaded", function () {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const villageSelect = document.getElementById("village");

  const locationData = {
    Maharashtra: {
      Pune: ["Hinjewadi", "Baner", "Hadapsar"],
      Mumbai: ["Andheri", "Bandra", "Dadar"],
    },
    Karnataka: {
      Bengaluru: ["Indiranagar", "Whitefield", "Koramangala"],
      Mysuru: ["VV Mohalla", "JP Nagar", "Nazarbad"],
    },
  };

  stateSelect.addEventListener("change", function () {
    const selectedState = stateSelect.value;
    districtSelect.innerHTML = "<option value=''>Select District</option>";
    villageSelect.innerHTML = "<option value=''>Select Village</option>";

    if (selectedState && locationData[selectedState]) {
      const districts = Object.keys(locationData[selectedState]);
      districts.forEach(function (district) {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    }
  });

  districtSelect.addEventListener("change", function () {
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;
    villageSelect.innerHTML = "<option value=''>Select Village</option>";

    if (
      selectedState &&
      selectedDistrict &&
      locationData[selectedState] &&
      locationData[selectedState][selectedDistrict]
    ) {
      const villages = locationData[selectedState][selectedDistrict];
      villages.forEach(function (village) {
        const option = document.createElement("option");
        option.value = village;
        option.textContent = village;
        villageSelect.appendChild(option);
      });
    }
  });
});
