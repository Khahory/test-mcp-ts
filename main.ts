import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from 'zod';

// 1 create the interface
// Maneja lo que es la comunicacion del cliente y servidor
console.log('Starting server...')
const server = new McpServer({
  name: 'myMcpServer',
  version: '1.0.0',
})

// 2 create the tools
// Las herramientas le permite al LLM realizar acciones a traves del servidor
server.tool(
  'getWeather', // name of the tool
  'Tool to get the weather of a city', // description of the tool
  {
    city: z.string().describe('City name'),
  },
  async ({city}) => {
    // 1. Geolocalización
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No results found for ${city}`,
          }
        ]
      };
    }

    // 2. Extraer coordenadas
    const {latitude, longitude} = data.results[0];
    // 3. Obtener clima
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=temperature_2m,current_weather=temperature_2m,precipitation,is_day,rain` +
      `&forecast_days=1`
    );
    const weatherData = await weatherResponse.json();

    return {
      // hardcodeando la respuesta
      content: [
        {
          type: 'text',
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    }
  },
)

// 3. Escuchar las conexiones del cliente
const transport = new StdioServerTransport()
server.connect(transport)