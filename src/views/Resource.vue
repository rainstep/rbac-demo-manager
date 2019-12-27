<template>
  <div class="main-content">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-edit" @click="handleAdd"
        >新增</el-button
      >
    </div>

    <el-table :data="resourceList" stripe border>
      <el-table-column prop="resourceId" label="资源ID" />
      <el-table-column prop="resourceName" label="资源名" />
      <el-table-column
        prop="resourceType"
        :formatter="typeFormatter"
        label="资源类型"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="del(scope.row.resourceId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="资源信息编辑"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      @close="handleDialogClose"
      width="500px"
    >
      <el-form
        :model="editResource"
        ref="editForm"
        :rules="resourceRules"
        label-width="80px"
      >
        <el-form-item label="资源名" prop="resourceName">
          <el-input
            v-model="editResource.resourceName"
            placeholder="2 ~ 10个字符"
          />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-select
            v-model="editResource.resourceType"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in resourceTypeList"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import rbacHttp from "@/rbac-http.js";

export default {
  name: "Resource",
  data() {
    return {
      resourceTypeList: [
        { type: 1, name: "接口" },
        { type: 2, name: "菜单" }
      ],
      resourceList: [],
      editResource: {},
      editDialogVisible: false,
      resourceRules: {
        resourceName: {
          required: true,
          min: 2,
          max: 10,
          message: "资源名长度在2 ~ 10个字符",
          trigger: "blur"
        },
        resourceType: {
          required: true,
          message: "资源类型不能为空",
          trigger: "blur"
        }
      }
    };
  },
  mounted() {
    this.find();
  },
  methods: {
    find() {
      let url = "/resource/list";
      rbacHttp
        .formPost(url)
        .then(response => (this.resourceList = response.data));
    },
    typeFormatter(row) {
      let resultItem = this.resourceTypeList.find(
        item => item.type === row.resourceType
      );
      return resultItem ? resultItem.name : "未知";
    },
    handleAdd() {
      this.editDialogVisible = true;
    },
    handleEdit(index, row) {
      this.editResource = row;
      this.editDialogVisible = true;
    },
    save() {
      this.$refs["editForm"].validate(valid => {
        if (!valid) return;
        let param = {
          ...this.editResource
        };
        let url = param.resourceId ? "/resource/modify" : "/resource/add";
        rbacHttp.formPost(url, param).then(() => {
          this.$message.success("操作成功");
          this.find();
          this.editDialogVisible = false;
        });
      });
    },
    handleDialogClose() {
      this.editResource = {};
      this.$refs["editForm"].clearValidate();
    },
    del(resourceId) {
      this.$confirm("确定要删除吗？", "提示", { type: "warning" })
        .then(() => {
          let url = "/resource/delete";
          let param = { resourceId };
          rbacHttp.formPost(url, param).then(() => {
            this.$message.success("删除成功");
            this.find();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped></style>
