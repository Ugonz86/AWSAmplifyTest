import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import Auth from "@aws-amplify/auth";
import { Amplify } from "aws-amplify";
import awsmobile from "./aws-exports";
Amplify.configure(awsmobile);

Auth.currentAuthenticatedUser().then((user) => {
  console.log(user.username)
})

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  // const [userName, setUserName] = useState(Auth.user.attributes.email);
  const [userName, setUserName] = useState(Auth.user.username)

  console.log(userName, "here!");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <View style={{              
              backgroundColor: "#bcd6d6",
              borderRadius: 20,
              margin: "0 auto",
              justifyContent: "center",
              marginBottom: 3,
              padding: 20,
              width: 600}}>
        <Heading level={1}>My Notes App</Heading>
        <Text>Hello {userName}!</Text>
      </View>

      <View as="form" margin="3rem 0" style={{ borderRadius: 20, justifyContent: 'center', margin: '0 auto'}} onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            color="grey"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            name="image"
            as="input"
            type="file"
            style={{ alignSelf: "end", borderRadius: 5 }}
            height={35}
            color="grey"
            
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>

      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="column"
            justifyContent="center"
            alignItems="center"
            width={600}
            style={{
              backgroundColor: "#bcd6d6",
              borderRadius: 20,
              margin: "0 auto",
              justifyContent: "center",
              marginBottom: 3,
              padding: 20,
            }}
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            {note.image && (
              <Image
                src={note.image}
                alt={`visual aid for ${notes.name}`}
                style={{ height: 400, borderRadius: 20 }}
              />
            )}
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut} variation="primary">Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
