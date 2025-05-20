import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from 'zod';

// 1 create the interface
// Maneja lo que es la comunicacion del cliente y servidor

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
    return {
      content: [
        {
          type: 'text',
          text: `The weather in ${city} is sunny`,
        },
      ],
    }
  },
)

// 3. Escuchar las conexiones del cliente
const transport = new StdioServerTransport()
server.connect(transport)