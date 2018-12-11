// https://stackoverflow.com/questions/43486278/how-do-i-structure-cloud-functions-for-firebase-to-deploy-multiple-functions-fro
export * from './main'; //needs to be first as it inits firebase
export * from "./http-functions";
export * from "./app"