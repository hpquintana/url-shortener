//init db once here
import { database } from "firebase-admin";

export const db = database().ref();