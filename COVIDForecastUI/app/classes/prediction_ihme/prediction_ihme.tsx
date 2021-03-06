import React from "react";
import { StyleSheet, View, Dimensions, Linking } from "react-native";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import {
  createAppContainer,
  SafeAreaView,
  ThemeContext,
} from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import {
  ApplicationProvider,
  IconRegistry,
  Layout,
  Text,
} from "@ui-kitten/components";
import moment from "moment";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";

import { IHMEStorage } from "../storage_abstraction/storage_abstraction";
import { currentState } from "../../../App";

let deviceHeight = Dimensions.get("window").height;
let deviceWidth = Dimensions.get("window").width;

let data: any;
export let predictionOut: any = "??????";

function wait(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function checkCache() {
  const cacheDate = await IHMEStorage.getItem("cacheDate");
  if (cacheDate != null) {
    return cacheDate;
  } else {
    return "2000-01-01";
  }
}

async function fetchCache(cacheDate: any) {
  let cacheCSV;
  if (cacheDate != undefined || cacheDate != null) {
    cacheCSV = await IHMEStorage.getItem(cacheDate);
  }
}

async function downloadSaveExt(date: string, ex?: boolean) {
  let tempPrediction: any;
  if (ex == undefined) {
    ex = true;
  }
  console.log("ex: " + ex);
  let url =
    "https://raw.githubusercontent.com/realToadtoad/CoVCast/master/ihme-covid-est.csv";
  //if ( data == undefined || data == null) {
  Papa.parse(url, {
    download: true,
    complete: async function (res) {
      data = res.data;
      console.log("has data");
      while (data == undefined || currentState == undefined) {
        await wait(500);
      }
      console.log("now filtering");
      let temp = data
        .filter(function (obj: any) {
          return obj[1] == currentState;
        })
        .find(function (obj: any) {
          return obj[2] == date;
        });
      console.log(temp);
      let predictionD = temp[21];
      let prediction = Math.round(predictionD * (1 / 0.034));
      console.log("prediction");
      console.log(prediction);
      if (ex == true) {
        predictionOut = prediction;
      } else {
        tempPrediction = prediction;
      }
    },
  });
  /*
  } else {
    console.log("has data");
    while ( data == undefined ||  currentState == undefined) {
      await wait(500);
    }
    console.log("now filtering");
    let temp = data
      .filter(function (obj: any) {
        return obj[1] == currentState;
      })
      .find(function (obj: any) {
        return obj[2] == date;
      });
    console.log(temp);
    let predictionD = temp[21];
    let prediction = Math.round(predictionD * (1 / 0.034));
    console.log("prediction");
    console.log(prediction);
    if(ex) {
      predictionOut = prediction;
    } else {
      tempPrediction = prediction;
    }
  }
  //*/
  if (ex == false) {
    while (tempPrediction == undefined) {
      await wait(500);
      console.log("in loop");
    }
    console.log("out of loop");
    return tempPrediction;
  }
  //let csv: string = Papa.unparse(data);
  //while( csv == undefined) {
  //  await wait(500);
  //}
  //await IHMEStorage.setItem(date, csv);
  //await IHMEStorage.setItem("cacheDate", date)
}

export async function fetchPredictionData(date?: string) {
  if (date == undefined) {
    date = moment().format("YYYY-MM-DD");
  }
  let cacheDate = moment(await checkCache());
  let today = moment();
  let duration = moment.duration(today.diff(cacheDate));
  if (Math.abs(duration.asDays()) >= 7) {
    await IHMEStorage.removeItem(date);
    await downloadSaveExt(date);
  } else {
    Papa.parse(await IHMEStorage.getItem(date), {
      complete: async function (res) {
        data = res.data;
        console.log("has data");
        while (data == undefined || currentState == undefined) {
          await wait(500);
        }
        console.log("now filtering");
        let temp = data
          .filter(function (obj: any) {
            return obj[1] == currentState;
          })
          .find(function (obj: any) {
            return obj[2] == date;
          });
        console.log("prediction");
        let predictionD = temp[21];
        let prediction = Math.round(predictionD * (1 / 0.034));
        predictionOut = prediction;
      },
    });
  }
}

export async function fetchPredictionDataNoExport(date?: string) {
  if (date == undefined) {
    date = moment().format("YYYY-MM-DD");
  }
  let cacheDate = moment(await checkCache());
  let today = moment();
  let duration = moment.duration(today.diff(cacheDate));
  let tempPrediction;
  //if (Math.abs(duration.asDays()) >= 7) {
    await IHMEStorage.removeItem(date);
    tempPrediction = await downloadSaveExt(date, false);
    /*
  } else {
    Papa.parse(await IHMEStorage.getItem(date), {
      complete: async function (res) {
        data = res.data;
        console.log("has data");
        while (data == undefined || currentState == undefined) {
          await wait(500);
        }
        console.log("now filtering");
        let temp = data
          .filter(function (obj: any) {
            return obj[1] == currentState;
          })
          .find(function (obj: any) {
            return obj[2] == date;
          });
        console.log("prediction");
        let predictionD = temp[21];
        let prediction = Math.round(predictionD * (1 / 0.034));
        tempPrediction = prediction;
      },
    });
  }
  //*/
  while (tempPrediction == undefined) {
    await wait(500);
  }
  console.log("tempPrediction: " + tempPrediction);
  return tempPrediction;
}
//*/
/*
export class Name extends React.Component {
  render() {
    return (
      <Layout style={styles.container}>
        <Text>
          Hello, world!
        </Text>
      </Layout>
    );
  }
}
//*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
