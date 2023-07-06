import React, { Component } from 'react';
import { withOktaAuth, oktaAuth } from '@okta/okta-react';
import logo from './logo.svg';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import axios from 'axios';


export default withOktaAuth(class Home extends Component {

  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      searchText: '',
      drugList: []
    };
    this.handleSearch = this.handleSearch.bind(this);



  }





  async handleSearch() {
    const searchText = this.state.searchText
    const oktaToken = await this.props.oktaAuth.getAccessToken();
    const encodedBody = new URLSearchParams();
    encodedBody.set("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
    encodedBody.set("subject_token_type", "urn:ietf:params:oauth:token-type:jwt");
    encodedBody.set("requested_token_type", "urn:ietf:params:oauth:token-type:jwt");
    encodedBody.set("subject_token", oktaToken);
    const encodedCredentials = btoa(`NFYdonsWGzcjS1raHIFX7AWNHzMa:qYyV7isJFWgYke1L7HheiRlSzG0a`);


    const res = await fetch("https://sts.choreo.dev/oauth2/token", {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedCredentials}`
      },
      body: encodedBody
    });
    const data = await res.json();
    console.log(data['access_token']);
    const exchangedToken = data['access_token'];
    try {
      const query = `query {
        findByDescription(description: "${searchText}") {
            description
            effectiveDate
            ndc
            nadac_PerUnit
          }
        }`;
      const res = await axios.post('https://2065132a-8a37-444b-89af-c5235a3cc052-prod.e1-us-east-azure.choreoapis.dev/jjpk/nadacdata/nadac-data-591/1.0.0/', { query }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${exchangedToken}`

        }
      });
      const fetchedData = res.data.data.findByDescription;
      console.log(fetchedData);
      this.setState({ drugList: fetchedData });


    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({ drugList: [] });

    }
  }

  async login() {
    await this.props.oktaAuth.signInWithRedirect();
  }

  async logout() {
    await this.props.oktaAuth.signOut();
  }

  render() {

    return (

      <div style={{ backgroundColor: 'white', color: 'blue', height: '60vh' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          {
            this.props.authState?.isAuthenticated
              ? (
                <div>

                  <button
                    style={{
                      backgroundColor: 'blue',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={this.logout}
                  >
                    Log out
                  </button>
                </div>
              )
              : <button
                style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={this.login}
              >
                Login
              </button>
          }


        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'right',
            height: '50%',
            paddingLeft: '20px',
          }}
        >
          <h1 style={{ color: 'blue' }}>National Average Drug Acquisition Cost</h1>
        </div>
        {this.props.authState?.isAuthenticated ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-50px' }}>
          <input
            type="text"
            style={{
              borderRadius: '20px',
              padding: '10px',
              width: '400px',
              marginRight: '10px',
              border: '1px solid blue',
            }}
            placeholder="Search..."
            value={this.searchText}
            onChange={(e) => this.setState({ searchText: e.target.value })}
          />
          <button
            style={{
              backgroundColor: 'blue',
              color: 'white',
              borderRadius: '20px',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={this.handleSearch}
          >
            Search
          </button>
        </div> : <div>
          <h1 style={{ color: 'blue', textAlign: 'center' }}>Please Login to Search</h1>
        </div>
        }
        <div style={{ height: '40px' }}></div>
        <div>
          <Container style={{ display: 'flex', justifyContent: 'center' }}>
            <Table striped bordered hover style={{ backgroundColor: '#f1f5f8' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#325ac2', color: '#fff', borderRadius: '8px 8px 0 0' }}>NDC</th>
                  <th style={{ backgroundColor: '#325ac2', color: '#fff', borderRadius: '0 0 0 0' }}>Description</th>
                  <th style={{ backgroundColor: '#325ac2', color: '#fff', borderRadius: '0 0 0 0' }}>Nadac Per Unit</th>
                  <th style={{ backgroundColor: '#325ac2', color: '#fff', borderRadius: '0 0 8px 8px' }}>Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {this.state.drugList &&
                  this.state.drugList.map((drug, index) => (
                    <tr key={index}>
                      <td style={{ backgroundColor: '#fff' }}>{drug.ndc}</td>
                      <td style={{ backgroundColor: '#fff' }}>{drug.description}</td>
                      <td style={{ backgroundColor: '#fff' }}>{drug.nadac_PerUnit}</td>
                      <td style={{ backgroundColor: '#fff' }}>{drug.effectiveDate}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>

          </Container>
        </div>
      </div>


    );
  }
});
