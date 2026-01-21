public class FileUploadRequestModel
{
    public IFormFile FileAdhar { get; set; }
    public IFormFile FileBankPassbook { get; set; }
    public IFormFile FileB1P1 { get; set; }
    public string ApplicationNumber { get; set; }
    public int UserId { get; set; }
}