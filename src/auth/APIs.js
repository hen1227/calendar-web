// const backendIP = 'http://10.31.64.51:4001';
// const backendIP = 'http://localhost:4001';
// TODO: Make this dependent on the environment
const backendIP = 'https://api.henhen1227.com';

export default function sendAPICall(
  toURL,
  method,
  data,
  currentUser,
  isAuthPath = false,
) {
  //console.log('POST' ? JSON.stringify(data) : null)
  return fetch(`${backendIP}${isAuthPath ? '/auth' : '/calendar'}${toURL}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentUser ? currentUser.token : ''}`,
    },
    body: method === 'POST' ? JSON.stringify(data) : null,
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      //console.log(data);
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    });
}
