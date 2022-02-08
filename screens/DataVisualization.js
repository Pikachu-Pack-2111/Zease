import { View, Text, Switch, Pressable } from "react-native";
import React from "react";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";

import { reformatDate, calculateSleepLength, getDateObj } from "../Util";
import { database, auth } from "../firebase";
import ChartA from "./ChartA";
import ChartB from "./ChartB";

const DataVisualization = () => {
  const [viewChartA, setViewChartA] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [data, setData] = useState([]);

  // const userId = "p9NHo83xCbVXWo3IRSj6plw9DXc2"; // Whitney ID
  // const userId = "AbNQWuHhkpSGbArIfJ17twjyuum1" // Alston ID
  //get sleep entry data from firebase
  useEffect(() => {
    const userId = auth.currentUser.uid;

    //get data from firebase. This is getting a "snapshot" of the data
    const sleepEntriesRef = database.ref(`sleepEntries/${userId}`);

    //this on method gets the value of the data at that reference.
    sleepEntriesRef.on("value", (snapshot) => {
      const sleepEntryData = snapshot.val();
      setData(sleepEntryData);
    });
  }, []);

  const structureData = (dataRaw, timeRange) => {
    const timeMap = {
      week: 7 * (1000 * 60 * 60 * 24),
      month: 30 * (1000 * 60 * 60 * 24),
      year: 365 * (1000 * 60 * 60 * 24),
    };
    const today = new Date();
    today.setHours(0, 0, 0);
    const scatterData = [];
    const lineDurationData = [];
    const lineQualityData = [];
    let sleepDurationMin = 24;
    let sleepDurationMax = 0;
    let sleepQualityMin = 100;
    let sleepQualityMax = 0;
    let firstDate = "3022-01-01";
    let lastDate = "1022-01-01";
    Object.values(dataRaw).forEach((entry) => {
      if (
        timeRange === "all" ||
        today - new Date(entry.date) < timeMap[timeRange]
      ) {
        let formatEntry = {
          sleepDuration: calculateSleepLength(entry),
          sleepQuality: entry.quality,
          date: entry.date,
          label: reformatDate(entry.date),
        };
        Object.values(entry.entryFactors).forEach((factor) => {
          formatEntry[factor.name] = true;
        });
        scatterData.push(formatEntry);
        lineDurationData.push({
          x: getDateObj(entry.date),
          y: calculateSleepLength(entry),
        });
        lineQualityData.push({ x: getDateObj(entry.date), y: entry.quality });
        sleepDurationMin = Math.min(
          sleepDurationMin,
          formatEntry.sleepDuration
        );
        sleepDurationMax = Math.max(
          sleepDurationMax,
          formatEntry.sleepDuration
        );
        sleepQualityMin = Math.min(sleepQualityMin, formatEntry.sleepQuality);
        sleepQualityMax = Math.max(sleepQualityMax, formatEntry.sleepQuality);
        if (firstDate > entry.date) firstDate = entry.date;
        if (lastDate < entry.date) lastDate = entry.date;
      }
    });
    return {
      scatterData,
      lineDurationData,
      lineQualityData,
      sleepDurationMin,
      sleepDurationMax,
      sleepQualityMin,
      sleepQualityMax,
      firstDate,
      lastDate,
    };
  };

  const structuredData = {
    week: structureData(data, "week"),
    month: structureData(data, "month"),
    year: structureData(data, "year"),
    all: structureData(data, "all"),
  };

  return (
    <View>
      <View style={tw`items-center`}>
        <View style={tw`flex-row`}>
          <Pressable onPress={() => setViewChartA(true)}>
            <Text
              style={tw`w-20 px-3 py-2 my-2 ${
                viewChartA ? `bg-blue-500 text-white` : `bg-gray-300 text-black`
              } text-center`}
            >
              Scatter
            </Text>
          </Pressable>
          <Pressable onPress={() => setViewChartA(false)}>
            <Text
              style={tw`w-20 px-3 py-2 my-2 rounded-full ${
                !viewChartA
                  ? `bg-blue-500 text-white`
                  : `bg-gray-300 text-black`
              } text-center`}
            >
              Line
            </Text>
          </Pressable>
        </View>
        <View style={tw`flex-row`}>
          <Pressable onPress={() => setTimeRange("week")}>
            <Text
              style={tw`w-20 px-3 py-2 my-2 ${
                timeRange === "week"
                  ? `bg-blue-500 text-white`
                  : `bg-gray-300 text-black`
              } text-center`}
            >
              1W
            </Text>
          </Pressable>
          <Pressable onPress={() => setTimeRange("month")}>
            <Text
              style={tw`w-20 px-3 py-2 my-2 ${
                timeRange === "month"
                  ? `bg-blue-500 text-white`
                  : `bg-gray-300 text-black`
              } text-center`}
            >
              1M
            </Text>
          </Pressable>
          <Pressable onPress={() => setTimeRange("year")}>
            <Text
              style={tw`w-20 px-3 py-2 my-2 ${
                timeRange === "year"
                  ? `bg-blue-500 text-white`
                  : `bg-gray-300 text-black`
              } text-center`}
            >
              1Y
            </Text>
          </Pressable>
          <Pressable onPress={() => setTimeRange("all")}>
            <Text
              style={tw`w-20 px-3 py-2 my-2 ${
                timeRange === "all"
                  ? `bg-blue-500 text-white`
                  : `bg-gray-300 text-black`
              } text-center`}
            >
              All
            </Text>
          </Pressable>
        </View>
        {viewChartA ? (
          <ChartA data={structuredData[timeRange]} />
        ) : (
          <ChartB data={structuredData[timeRange]} />
        )}
      </View>
    </View>
  );
};

export default DataVisualization;
