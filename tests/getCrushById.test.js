const frisby = require('frisby');
const fs = require('fs');
const path = require('path');

const url = 'http://localhost:3000';

describe('2 - Crie o endpoint GET /crush/:id', () => {
  beforeEach(() => {
    const crushSeed = fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8');
  
    fs.writeFileSync(path.join(__dirname, '..', 'crush.json'), crushSeed, 'utf8');
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
