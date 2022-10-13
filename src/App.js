import React, { Component }  from 'react';
import logo from "./logo.svg";
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";

import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';
Amplify.configure(awsmobile);

function App({ signOut }) {
  return (
    <View >
      <Card>
        <Image src={logo} alt="logo" />
        <Heading level={1}>We now have Auth!</Heading>
      </Card>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);