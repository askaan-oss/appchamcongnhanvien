using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace NfcAttendance.Api.Hubs
{
    public class AttendanceHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }
    }
}

