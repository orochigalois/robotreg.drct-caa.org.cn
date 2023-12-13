package com.zts.robot.util;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfCopy;
import com.itextpdf.text.pdf.PdfImportedPage;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;

public class PdfModeForPdf {
	public static void formFdfModeForPdf(Map<String, String> dataParamMap, String savePdfPath,
			String wordModelPathCup) throws DocumentException, IOException {
		String fileName = "/root/ROOT/staticrobot/zip/测试123456.txt";
        String content = "Hello, this is a 测试";

        try {
            // Create a FileOutputStream for the specified file
            FileOutputStream fos = new FileOutputStream(fileName);

            // Convert the content to bytes and write it to the file
            byte[] bytes = content.getBytes();
            fos.write(bytes);

            // Close the FileOutputStream
            fos.close();

            System.out.println("File created and content written successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        
		
		BaseFont simheiChinese = BaseFont.createFont(MyProperties.getKey("simhei"),BaseFont.IDENTITY_H,BaseFont.EMBEDDED);
		
		PdfReader reader;
		FileOutputStream out;
		ByteArrayOutputStream bos;
		PdfStamper stamper;
		
			out = new FileOutputStream(savePdfPath);// 输出流
			reader = new PdfReader(wordModelPathCup);// 读取pdf模板
			bos = new ByteArrayOutputStream();
			stamper = new PdfStamper(reader, bos);
			AcroFields form = stamper.getAcroFields();
			
			 PdfContentByte pcb = stamper.getOverContent(1);
				//获取表单域坐标
				List<AcroFields.FieldPosition> list = form.getFieldPositions("成员");  
	            Rectangle rect = list.get(0).position;
	            //创建PDF表格
	            PdfPTable table = new PdfPTable(2);
	            float tatalWidth = rect.getRight() - rect.getLeft() - 1;  
	            //计算表格宽度
	            float[] columnWidth ={(float) (tatalWidth*0.17),(float)(tatalWidth*0.83)};
	            table.setTotalWidth(columnWidth);
	            
	            Font FontProve = new Font(simheiChinese, 15, 0);
	            Paragraph p11 = new Paragraph("指导教师：", FontProve);
	            Paragraph p12 = new Paragraph((String) dataParamMap.get("教师"), FontProve);
	            Paragraph p21 = new Paragraph("队    员：", FontProve);
	            Paragraph p22 = new Paragraph((String) dataParamMap.get("队员"), FontProve);
	            
	            PdfPCell cell11 = new PdfPCell(p11);
	            //cell11.setFixedHeight(rect.getTop() - rect.getBottom() - 1);  
	            cell11.setBorderWidth(0);  
	            cell11.setVerticalAlignment(Element.ALIGN_LEFT);  
	            cell11.setHorizontalAlignment(Element.ALIGN_LEFT);  
	            cell11.setLeading(0, (float) 1.4);
	            table.addCell(cell11);
	            
	            PdfPCell cell12 = new PdfPCell(p12);
	            //cell12.setFixedHeight(rect.getTop() - rect.getBottom() - 1);  
	            cell12.setBorderWidth(0);  
	            cell12.setVerticalAlignment(Element.ALIGN_LEFT);  
	            cell12.setHorizontalAlignment(Element.ALIGN_LEFT);  
	            cell12.setLeading(0, (float) 1.4);
	            table.addCell(cell12);
	            
	            PdfPCell cell21 = new PdfPCell(p21);
	            //cell11.setFixedHeight(rect.getTop() - rect.getBottom() - 1);  
	            cell21.setBorderWidth(0);  
	            cell21.setVerticalAlignment(Element.ALIGN_LEFT);  
	            cell21.setHorizontalAlignment(Element.ALIGN_LEFT);  
	            cell21.setLeading(0, (float) 1.4);
	            table.addCell(cell21);
	            
	            PdfPCell cell22 = new PdfPCell(p22);
	            //cell12.setFixedHeight(rect.getTop() - rect.getBottom() - 1);  
	            cell22.setBorderWidth(0);  
	            cell22.setVerticalAlignment(Element.ALIGN_LEFT);  
	            cell22.setHorizontalAlignment(Element.ALIGN_LEFT);  
	            cell22.setLeading(0, (float) 1.4);
	            table.addCell(cell22);
	            
	            table.writeSelectedRows(0, -1, rect.getLeft(), rect.getTop(), pcb);
			
//	            for (String key : dataParamMap.keySet()) {	            	
//                    form.setField(key,dataParamMap.get(key).toString());
//	            }
	            
	            for (String key : dataParamMap.keySet()) {	
	            	int ilen = dataParamMap.get(key).toString().length();
	            	if(key == "学校" || key == "队伍"){
	            		if(ilen >= 20 && ilen < 40){
	            			form.setFieldProperty(key, "textsize", new Float(10), null);
	            		}else if(ilen >= 40 && ilen <= 55){
	            			form.setFieldProperty(key, "textsize", new Float(7), null);
	            		}else if(ilen > 55){
	            			form.setFieldProperty(key, "textsize", new Float(6), null);
	            		}
	            	}
	            	
	            	form.setField(key,dataParamMap.get(key).toString());
	            }
	            
	            form.setField("成员", "");
	            stamper.setFormFlattening(true);// 如果为false那么生成的PDF文件还能编辑，一定要设为true  
	            stamper.close();

			Document doc = new Document();
			PdfCopy copy = new PdfCopy(doc, out);
			doc.open();
			PdfImportedPage importPage = copy.getImportedPage(new PdfReader(bos.toByteArray()), 1);
			copy.addPage(importPage);
			doc.close();
		
	}

	public static void replaceFormFdfModeForPdf(Map<String, String> dataParamMap, String savePdfPath,
			String wordModelPathCup) throws DocumentException, IOException {
		
		BaseFont fzcsjtChinese = BaseFont.createFont(MyProperties.getKey("fzcs"),BaseFont.IDENTITY_H,BaseFont.EMBEDDED);
		PdfReader reader;
		FileOutputStream out;
		ByteArrayOutputStream bos;
		PdfStamper stamper;
		
			out = new FileOutputStream(savePdfPath);// 输出流
			reader = new PdfReader(wordModelPathCup);// 读取pdf模板
			bos = new ByteArrayOutputStream();
			stamper = new PdfStamper(reader, bos);
			AcroFields form = stamper.getAcroFields();
			PdfContentByte pcb = stamper.getOverContent(1);
			
			String prove = form.getField("证明");
			//获取表单域坐标
			List<AcroFields.FieldPosition> list = form.getFieldPositions("证明");  
            Rectangle rect = list.get(0).position;
            //创建PDF表格
            PdfPTable table = new PdfPTable(1);
            float tatalWidth = rect.getRight() - rect.getLeft() - 1;  
            //计算表格宽度
            table.setTotalWidth(tatalWidth);
            Font FontProve = new Font(fzcsjtChinese, 18, 0);
            Font FontProveUnderLine = new Font(fzcsjtChinese, 18,Font.UNDERLINE );
            Paragraph p1 = new Paragraph();
            int indexStart=0;
            int indexEnd=0;
            while(prove.length()>0){
            	
            	indexStart = prove.indexOf("<");
            	indexEnd = prove.indexOf(">");
            	if(indexStart==-1){
            		p1.add(new Chunk(prove, FontProve));
            		break;
            	}else{
            		String key = prove.substring(indexStart+1, indexEnd);
                	String str = prove.substring(0,indexStart);
                	prove = prove.substring(indexEnd+1);
                	p1.add(new Chunk(str, FontProve));
                	p1.add(new Chunk(dataParamMap.get(key), FontProveUnderLine));
            	}            	
            }
            	
			
            PdfPCell cell = new PdfPCell(p1);
            cell.setFixedHeight(rect.getTop() - rect.getBottom() - 1);  
            cell.setBorderWidth(0);  
            cell.setVerticalAlignment(Element.ALIGN_LEFT);  
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);  
            cell.setLeading(0, (float) 1.7);
            table.addCell(cell);
            table.writeSelectedRows(0, -1, rect.getLeft(), rect.getTop(), pcb);
			
            form.setField("编号", dataParamMap.get("编号").toString());
			form.setField("证明", "");
			
			stamper.setFormFlattening(true);// 如果为false那么生成的PDF文件还能编辑，一定要设为true
			stamper.close();

			Document doc = new Document();
			PdfCopy copy = new PdfCopy(doc, out);
			doc.open();
			PdfImportedPage importPage = copy.getImportedPage(new PdfReader(bos.toByteArray()), 1);
			copy.addPage(importPage);
			doc.close();
		
	}
}
