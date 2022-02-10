import {
  StyleSheet,
  View,
  Text,
  Button,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Slider from "@react-native-community/slider";
import MultiSelect from "react-native-multiple-select";
import { useSelector, useDispatch } from "react-redux";
import tw from "tailwind-react-native-classnames";

import { yesterday, convertToMilitaryString, convertToAmPm } from "../Util";
import { goAddUserEntry } from "../store/userEntries";

const AddEntry = () => {
  const dispatch = useDispatch();
  // User sleep factors (pulled in from redux)
  let userFactors = useSelector((state) => state.userFactors);
  const [userFactorsArr, setUserFactorsArr] = useState([]);

  // Form state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quality, setQuality] = useState(0);
  const [entryFactorsArr, setEntryFactorsArr] = useState([]);
  const [notes, setNotes] = useState("");

  // Time picker state
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Initialize time picker
  const bedTimeModalRef = useRef();
  const wakeTimeModalRef = useRef();

  // Sleep factor multiselect ref (used to call prototype methods)
  const multiSelectRef = useRef();

  // Hide modals for both time pickers
  const hideTimePickers = () => {
    setStartTimePickerVisible(false);
    setEndTimePickerVisible(false);
  };

  // Set state for sleep startTime once modal picker selection confirmed
  const handleConfirmStart = (time) => {
    setStartTime(convertToMilitaryString(time));
    hideTimePickers();
  };

  // Set state for sleep endTime once modal picker selection confirmed
  const handleConfirmEnd = (time) => {
    setEndTime(convertToMilitaryString(time));
    hideTimePickers();
  };

  // Set state for sleep quality when slider changes
  const handleSelectQuality = (val) => {
    setQuality(val);
  };

  const onEntryFactorsChange = (selectedItems) => {
    setEntryFactorsArr(selectedItems);
  };

  // Reformat factors to array of objects, with keys id, name, and category
  useEffect(() => {
    const formattedFactors = [];
    for (let key in userFactors) {
      formattedFactors.push({ ...userFactors[key], id: key });
    }
    setUserFactorsArr(formattedFactors);
  }, [userFactors]);

  const handleSubmit = async () => {
    // Validate form data
    if (!startTime || !endTime || !quality) {
      Alert.alert("Error", "Please fill in all required fields!");
      return;
    }

    // Set formData date to date string yyyy-mm-dd (of previous day)
    const date = yesterday();

    const entryFactors = {};
    entryFactorsArr.forEach(
      (factorId) => (entryFactors[factorId] = userFactors[factorId])
    ); // Only grab name and category
    // Set formData factors to formatted selectedItems (selected items will be array of ids)
    const formData = { date, startTime, endTime, quality, entryFactors, notes };
    // Write form inputs to firebase.  this will also dispatch function to put set this new entry as the newest entry in redux and for this new entry to be included in userEntries.
    dispatch(goAddUserEntry(formData));
    // Success alert
    Alert.alert("Entry submitted!");
    // Reset form data
    setStartTime("");
    setEndTime("");
    setQuality(0);
    setEntryFactorsArr([]);
    setNotes("");
    // TODO: Take user to SingleEntry view of submitted entry
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <Text style={tw`font-bold text-3xl text-white mb-5 text-center`}>
          Add Entry
        </Text>
        <View>
          <View style={styles.accountItem}>
            <Text style={tw`font-semibold text-white`}>{`Bed Time:`}</Text>
            <Button
              title={startTime ? convertToAmPm(startTime) : "Select"}
              onPress={() => {
                setStartTimePickerVisible(true);
                bedTimeModalRef.current.state.currentDate.setHours(20, 0, 0, 0);
              }}
            />
          </View>
          <DateTimePickerModal
            isVisible={startTimePickerVisible}
            mode="time"
            ref={bedTimeModalRef}
            onConfirm={handleConfirmStart}
            onCancel={hideTimePickers}
          />
          <View style={styles.accountItem}>
            <Text style={tw`font-semibold text-white`}>{`Wake Time:`}</Text>
            <Button
              title={endTime ? convertToAmPm(endTime) : "Select"}
              onPress={() => {
                setEndTimePickerVisible(true);
                wakeTimeModalRef.current.state.currentDate.setHours(8, 0, 0, 0);
              }}
            />
          </View>
          <DateTimePickerModal
            isVisible={endTimePickerVisible}
            mode="time"
            ref={wakeTimeModalRef}
            onConfirm={handleConfirmEnd}
            onCancel={hideTimePickers}
          />
          <Text style={tw`font-semibold text-white mb-3`}>Sleep Quality</Text>
          <Slider
            step={1}
            minimumValue={0}
            maximumValue={100}
            value={quality}
            onValueChange={handleSelectQuality}
            minimumTrackTintColor="#3395ff"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#eeeeee"
          />
          <Text style={tw`font-semibold text-white mb-3 mt-5`}>Factors</Text>
          <MultiSelect
            hideTags
            items={userFactorsArr}
            uniqueKey="id"
            onSelectedItemsChange={onEntryFactorsChange}
            selectedItems={entryFactorsArr}
            selectText="Select factors..."
            searchInputPlaceholderText="Search factors..."
            ref={multiSelectRef}
            onChangeInput={(text) => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{ color: "#CCC" }}
            submitButtonColor="#CCC"
            submitButtonText="Submit"
          />
          <Text style={tw`font-semibold text-white mb-3 mt-5`}>Notes</Text>
          <TextInput
            style={styles.input}
            multiline={true}
            numberOfLines={4}
            placeholder="Enter notes..."
            onChangeText={(input) => setNotes(input)}
            value={notes}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              accessibilityLabel="Submit Edit Sleep Entry Form"
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddEntry;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C3F52",
    opacity: 0.95,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "80%",
    marginTop: 60,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#F78A03",
    paddingVertical: 12,
    width: 150,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    color: "white",
  },
});
