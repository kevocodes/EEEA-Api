const main = async () => {
  // -------------------
  // REQUEST
  // -------------------

  const data = {
    email: 'rockevinche@gmail.com',
    password: 'Kevin1!',
  };

  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // body: `{"email":"rockevinche@gmail.com","password":"Kevin1!"}`,
    body: JSON.stringify(data),
  });

  // -------------------
  // RESPONSE
  // -------------------
  console.log(response.status + ' ' + response.statusText);
  console.log(response.headers);

  //body
  const json = await response.json();

  console.log('body', json);
};

//main();

const requestExample = async () => {
  /* PARTES DE UN ENDPOINT (URL)
    [protocolo]://[dominio]:[puerto]/[recurso o endpoint]/[params?]?[query?]

    protocolo: http, https, ftp, ws, etc. -> http y https son los más comunes
    dominio: localhost, myapi.vercel.app, myapp.railway.app, postsapi.kevo.codes,etc. -> es la dirección de la API
    puerto: 3000, 8080, 80, 443, etc. -> es el puerto donde la API está escuchando, mas usado en desarrollo

    recurso o endpoint: /auth/login, /posts, /users, /products, etc. -> es la parte de la URL que indica la acción que se quiere realizar hacia una entidad o recurso
    
    params: /users/1, /posts/2, /products/3, etc. -> son parámetros que se envían a la API para realizar una acción específica

    query: ?page=1&limit=10, ?search=kevin, ?sort=asc, etc. -> son parámetros que se envían a la API para filtrar, ordenar o paginar los resultados
  */
  let PROTOCOL = 'https://';
  let DOMAIN = 'rickandmortyapi.com';
  let ENDPOINT = '/api/character';
  let PARAMS = '/1';
  let QUERY = '';
  // https://rickandmortyapi.com/api/character/1?

  // GET /character

  const response = await fetch();
};

requestExample();
