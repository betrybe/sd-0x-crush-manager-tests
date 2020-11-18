const frisby = require('frisby');
const fs = require('fs');
const path = require('path');

const url = 'http://localhost:3000';

describe('', () => {
  beforeEach(() => {
    const crushSeed = fs.readFileSync(
      path.join(__dirname, 'seed.json'),
      'utf8'
    );

    fs.writeFileSync(
      path.join(__dirname, '..', 'crush.json'),
      crushSeed,
      'utf8'
    );
  });
  it('Será validado que é possível fazer uma busca por termo com sucesso', async () => {
    const crushMock = fs.readFileSync(
      path.join(__dirname, 'seed.json'),
      'utf8'
    );

    fs.writeFileSync(
      path.join(__dirname, '..', 'crush.json'),
      crushMock,
      'utf8'
    );

    await frisby
      .post(`${url}/login`, {
        email: 'deferiascomigo@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
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
          .post(`${url}/crush`, {
            name: 'Miley Cyrus',
            age: 27,
            date: {
              datedAt: '25/09/2020',
              rate: 4,
            },
          })
          .expect('status', 201);
      });

    await frisby
      .post(`${url}/login`, {
        email: 'deferiascomigo@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
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
          .get(`${url}/crush/search?q=M`)
          .expect('status', 200)
          .then((responseLogin) => {
            const { json } = responseLogin;
            expect(json).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  name: 'Madonna',
                  age: 62,
                  id: 1,
                  date: { datedAt: '23/10/2020', rate: 5 },
                }),
                expect.objectContaining({
                  name: 'Miley Cyrus',
                  age: 27,
                  date: {
                    datedAt: '25/09/2020',
                    rate: 4,
                  },
                }),
              ])
            );
          });
      });
  });

  it('Será validado que não é possível fazer uma busca por termo sem estar autorizado', async () => {
    await frisby
      .post(`${url}/login`, {
        body: {
          email: 'deferiascomigo@gmail.com',
          password: '12345678',
        },
      })
      .then(() => {
        return frisby
          .setup()
          .get(`${url}/crush/search?q=Ma`, {
            name: 'Zendaya',
            age: 25,
            date: {
              datedAt: '24/10/2020',
              rate: 4,
            },
          })
          .expect('status', 401)
          .then((responsePost) => {
            const { json } = responsePost;
            expect(json.message).toBe('Token não encontrado');
          });
      });
  });

  it('Será validado que não é possível fazer uma busca por termo com token inválido', async () => {
    await frisby

      .post(`${url}/login`, {
        body: {
          email: 'deferiascomigo@gmail.com',
          password: '12345678',
        },
      })
      .then(() => {
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: '99999999',
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/crush/search?=Ma`)
          .expect('status', 401)
          .then((responsePost) => {
            const { json } = responsePost;
            expect(json.message).toBe('Token inválido');
          });
      });
  });
});
