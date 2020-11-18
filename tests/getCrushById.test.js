const frisby = require('frisby');
const fs = require('fs');
const path = require('path');

const url = 'http://localhost:3000';

describe('4 - Crie o endpoint GET /crush/:id', () => {
  beforeEach(() => {
    const crushSeed = fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8');
  
    fs.writeFileSync(path.join(__dirname, '..', 'crush.json'), crushSeed, 'utf8');
  });
  it('Será validado caso o token não seja encontrado retorne um código de status 401', async () => {
    await frisby
      .post(`${url}/login`, {
        body: {
          email: 'deferiascomigo@gmail.com',
          password: '12345678',
        },
      })
      .then(() => 
        frisby
          .setup({
            request: {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/crush/9`)
          .expect('status', 401)
          .then((responsePost) => {
            const { json } = responsePost;
            expect(json.message).toBe('Token não encontrado');
          })
      );
  });

  it('Será validado que caso o token seja inválido retorne um código de status 404', async () => {
    await frisby
      .post(`${url}/login`, {
        body: {
          email: 'deferiascomigo@gmail.com',
          password: '12345678',
        },
      })
      .then((response) =>{
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/crush/9`)
          .expect('status', 404)
          .then((response) => {
            const { json } = response;
            expect(json.message).toBe('Crush não encontrado');
          })
      })
  });

  it('Será validado que o endpoint deve retornar um crush baseado no id da rota. Devendo retornar o `status 200` ', async () => {
    await frisby
      .post(`${url}/login`, {
        body: {
          email: 'deferiascomigo@gmail.com',
          password: '12345678',
        },
      })
      .then((response) =>{
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/crush/1`)
          .expect('status', 200)
          .then((responseGet) => {
            const { json } = responseGet;
            expect(json).toEqual({
              "name": "Madonna",
              "age": 62,
              "id": 1,
              "date": { "datedAt": "23/10/2020", "rate": 5 }
            })
          })
        });
    })
});
