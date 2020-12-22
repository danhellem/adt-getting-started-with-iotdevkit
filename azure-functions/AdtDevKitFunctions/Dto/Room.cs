using Microsoft.Azure.Amqp.Framing;
using System;
using System.Collections.Generic;
using System.Text;

namespace AdtDevKitFunctions.Dto
{
    public class Room
    {
        public string Id { get; set; }
        public double Temperature { get; set; } = -99;
        public double Humidity { get; set; } = -99;
    }
}
