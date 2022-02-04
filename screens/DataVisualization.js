import { View, Text, Switch } from "react-native";
import React from "react";
import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";

import { database } from "../firebase";
import ChartA from "./ChartA";
import ChartB from "./ChartB";

const DataVisualization = () => {
  const [viewChartA, toggleChartView] = useState(true);
  const [data, setData] = useState([]);

  useEffect(async () => {
    //get the userId from async storage
    const userId = await AsyncStorage.getItem("userID");

    //get data from firebase. This is getting a "snapshot" of the data
    const sleepEntriesRef = database.ref(`sleepEntries/${JSON.parse(userId)}`);

    //this on method gets the value of the data at that reference.
    sleepEntriesRef.on("value", (snapshot) => {
      const sleepEntryData = snapshot.val();
      // console.log(
      //   "sleep entry data pulled from db before it is put on local state",
      //   sleepEntryData
      // );
      setData(sleepEntryData);
    });
  }, []);

  return (
    <View>
      <View style={tw` items-center justify-center`}>
        <Switch
          value={viewChartA}
          onValueChange={() => toggleChartView(!viewChartA)}
        />
        {viewChartA ? <ChartA data={data} /> : <ChartB data={data} />}
      </View>
    </View>
  );
};

export default DataVisualization;
